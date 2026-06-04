const express = require('express');
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

const router = express.Router();

router.post(
  '/',
  [auth, [check('type', 'Type is required').isIn(['income', 'expense']), check('amount', 'Amount is required').isNumeric()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const tx = new Transaction({ ...req.body, user: req.user.id });
      await tx.save();
      res.json(tx);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, q, category, startDate, endDate, sort } = req.query;
    const query = { user: req.user.id };
    if (q) query.$or = [{ notes: new RegExp(q, 'i') }, { source: new RegExp(q, 'i') }];
    if (category) query.category = category;
    if (startDate || endDate) query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
    let txQuery = Transaction.find(query).skip((page - 1) * limit).limit(parseInt(limit));
    if (sort === 'amount_asc') txQuery = txQuery.sort({ amount: 1 });
    else if (sort === 'amount_desc') txQuery = txQuery.sort({ amount: -1 });
    else txQuery = txQuery.sort({ date: -1 });
    const txs = await txQuery.exec();
    const total = await Transaction.countDocuments(query);
    res.json({ data: txs, total });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const tx = await Transaction.findOne({ _id: req.params.id, user: req.user.id });
    if (!tx) return res.status(404).json({ msg: 'Transaction not found' });
    res.json(tx);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    let tx = await Transaction.findOne({ _id: req.params.id, user: req.user.id });
    if (!tx) return res.status(404).json({ msg: 'Transaction not found' });
    Object.assign(tx, req.body);
    await tx.save();
    res.json(tx);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const tx = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!tx) return res.status(404).json({ msg: 'Transaction not found' });
    res.json({ msg: 'Deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/analytics/summary', auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const summaryStats = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalIncome: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
          totalExpense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } }
        }
      }
    ]);

    const byCategoryStats = await Transaction.aggregate([
      { $match: { user: userId, type: 'expense' } },
      {
        $group: {
          _id: { $ifNull: ['$category', 'Other'] },
          total: { $sum: '$amount' }
        }
      }
    ]);

    const monthlyStats = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          income: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
          expense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const byCategory = {};
    byCategoryStats.forEach(c => {
      byCategory[c._id] = c.total;
    });

    const formattedMonthly = monthlyStats.map(stat => {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const label = `${monthNames[stat._id.month - 1]} ${stat._id.year.toString().slice(-2)}`;
      return {
        month: label,
        rawMonth: `${stat._id.year}-${String(stat._id.month).padStart(2, '0')}`,
        income: stat.income,
        expense: stat.expense,
        savings: Math.max(0, stat.income - stat.expense)
      };
    });

    const totalIncome = summaryStats[0]?.totalIncome || 0;
    const totalExpense = summaryStats[0]?.totalExpense || 0;
    const balance = totalIncome - totalExpense;

    res.json({
      totalIncome,
      totalExpense,
      balance,
      byCategory,
      monthlyStats: formattedMonthly
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.post('/seed', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    await Transaction.deleteMany({ user: userId });
    await Budget.deleteMany({ user: userId });

    const transactions = [];
    const budgets = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const year = now.getFullYear();
      const monthVal = now.getMonth() - i;
      const d = new Date(year, monthVal, 1);
      const y = d.getFullYear();
      const m = d.getMonth();

      const monthString = `${y}-${String(m + 1).padStart(2, '0')}`;

      budgets.push({
        user: userId,
        month: monthString,
        amount: 3200
      });

      transactions.push({
        user: userId,
        type: 'income',
        amount: 4500,
        source: 'Primary Salary',
        date: new Date(y, m, 1),
        notes: 'Monthly corporate salary deposit'
      });

      transactions.push({
        user: userId,
        type: 'income',
        amount: 600 + Math.floor(Math.random() * 800),
        source: 'Freelance Design',
        date: new Date(y, m, 15),
        notes: 'Freelance UI design project payment'
      });

      transactions.push({
        user: userId,
        type: 'income',
        amount: 50 + Math.floor(Math.random() * 100),
        source: 'Investment Dividends',
        date: new Date(y, m, 25),
        notes: 'Quarterly dividends payout'
      });

      transactions.push({
        user: userId,
        type: 'expense',
        amount: 1400,
        category: 'Housing',
        date: new Date(y, m, 2),
        notes: 'Apartment monthly rent'
      });

      transactions.push({
        user: userId,
        type: 'expense',
        amount: 120 + Math.floor(Math.random() * 60),
        category: 'Utilities',
        date: new Date(y, m, 5),
        notes: 'Electricity and water utility bill'
      });

      transactions.push({
        user: userId,
        type: 'expense',
        amount: 85,
        category: 'Utilities',
        date: new Date(y, m, 8),
        notes: 'High-speed fiber internet and streaming plan'
      });

      const groceryDates = [4, 11, 18, 25];
      groceryDates.forEach(day => {
        transactions.push({
          user: userId,
          type: 'expense',
          amount: 80 + Math.floor(Math.random() * 70),
          category: 'Food',
          date: new Date(y, m, day),
          notes: 'Weekly supermarket grocery run'
        });
      });

      const diningDates = [6, 13, 20, 27];
      diningDates.forEach((day, index) => {
        const descriptions = ['Dinner with friends', 'Weekend brunch', 'Sushi night', 'Local cafe coffee & snacks'];
        transactions.push({
          user: userId,
          type: 'expense',
          amount: 25 + Math.floor(Math.random() * 65),
          category: 'Food',
          date: new Date(y, m, day),
          notes: descriptions[index]
        });
      });

      const transportDates = [9, 23];
      transportDates.forEach(day => {
        transactions.push({
          user: userId,
          type: 'expense',
          amount: 40 + Math.floor(Math.random() * 25),
          category: 'Transportation',
          date: new Date(y, m, day),
          notes: 'Gas tank refill'
        });
      });

      transactions.push({
        user: userId,
        type: 'expense',
        amount: 45 + Math.floor(Math.random() * 60),
        category: 'Entertainment',
        date: new Date(y, m, 14),
        notes: 'Cinema tickets and snacks'
      });
      if (Math.random() > 0.4) {
        transactions.push({
          user: userId,
          type: 'expense',
          amount: 80 + Math.floor(Math.random() * 100),
          category: 'Entertainment',
          date: new Date(y, m, 28),
          notes: 'Concert ticket / Event entry'
        });
      }

      transactions.push({
        user: userId,
        type: 'expense',
        amount: 75 + Math.floor(Math.random() * 180),
        category: 'Shopping',
        date: new Date(y, m, 16),
        notes: 'Monthly shopping store purchase'
      });

      transactions.push({
        user: userId,
        type: 'expense',
        amount: 30 + Math.floor(Math.random() * 40),
        category: 'Health',
        date: new Date(y, m, 22),
        notes: 'Pharmacy prescriptions and vitamins'
      });

      if (Math.random() > 0.5) {
        transactions.push({
          user: userId,
          type: 'expense',
          amount: 15 + Math.floor(Math.random() * 50),
          category: 'Other',
          date: new Date(y, m, 19),
          notes: 'Miscellaneous small expense'
        });
      }
    }

    await Transaction.insertMany(transactions);
    await Budget.insertMany(budgets);

    res.json({ msg: 'Demo data seeded successfully!', count: transactions.length });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
