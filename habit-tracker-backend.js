// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Define Habit Schema
const habitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  points: { type: Number, default: 1 },
  completedDates: [String],
  description: String,
});

const Habit = mongoose.model('Habit', habitSchema);

// Routes
app.get('/api/habits', async (req, res) => {
  try {
    const habits = await Habit.find();
    res.json(habits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/habits', async (req, res) => {
  const habit = new Habit({
    name: req.body.name,
    points: req.body.points,
    description: req.body.description,
  });

  try {
    const newHabit = await habit.save();
    res.status(201).json(newHabit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/habits/:id', async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (habit == null) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    if (req.body.name != null) {
      habit.name = req.body.name;
    }
    if (req.body.points != null) {
      habit.points = req.body.points;
    }
    if (req.body.description != null) {
      habit.description = req.body.description;
    }
    if (req.body.completedDates != null) {
      habit.completedDates = req.body.completedDates;
    }

    const updatedHabit = await habit.save();
    res.json(updatedHabit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/habits/:id', async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (habit == null) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    await habit.remove();
    res.json({ message: 'Habit deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
