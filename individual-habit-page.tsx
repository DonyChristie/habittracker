import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const IndividualHabitPage = ({ habits, updateHabit }) => {
  const { id } = useParams();
  const habitIndex = parseInt(id);
  const habit = habits[habitIndex];

  const [description, setDescription] = useState(habit.description || '');

  useEffect(() => {
    setDescription(habit.description || '');
  }, [habit]);

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const saveDescription = () => {
    updateHabit(habitIndex, { ...habit, description });
  };

  const getHabitData = () => {
    const data = [];
    const today = new Date();
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      data.push({
        date: dateString,
        completed: habit.completedDates.includes(dateString) ? 1 : 0,
      });
    }
    return data;
  };

  if (!habit) {
    return <div>Habit not found</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Link to="/" className="text-blue-500 hover:underline mb-4 block">&larr; Back to Dashboard</Link>
      <h1 className="text-3xl font-bold mb-4">{habit.name}</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Description</h2>
        <textarea
          value={description}
          onChange={handleDescriptionChange}
          onBlur={saveDescription}
          className="w-full p-2 border rounded"
          rows="4"
        />
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">30-Day Progress</h2>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={getHabitData()}>
              <XAxis dataKey="date" />
              <YAxis domain={[0, 1]} ticks={[0, 1]} />
              <Tooltip />
              <Line type="stepAfter" dataKey="completed" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-2">Stats</h2>
        <p>Current streak: {/* Calculate current streak */}</p>
        <p>Longest streak: {/* Calculate longest streak */}</p>
        <p>Completion rate: {/* Calculate completion rate */}</p>
      </div>
    </div>
  );
};

export default IndividualHabitPage;
