const express = require('express');
const auth = require('../middleware/auth');
const Budget = require('../models/Budget');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id }).sort({ month: -1 });
    res.json(budgets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { month, amount } = req.body;
    let budget = await Budget.findOne({ user: req.user.id, month });
    if (budget) {
      budget.amount = amount;
      await budget.save();
      return res.json(budget);
    }
    budget = new Budget({ user: req.user.id, month, amount });
    await budget.save();
    res.json(budget);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Budget.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ msg: 'Deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
