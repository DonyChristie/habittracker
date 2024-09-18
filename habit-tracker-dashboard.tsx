import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Trash2, GripVertical, Edit, ExternalLink, ArrowLeft } from 'lucide-react';

const Button = ({ children, onClick, className, variant }) => (
  <button 
    onClick={onClick} 
    className={`px-4 py-2 rounded ${
      variant === 'destructive' ? 'bg-red-500 text-white' : 
      variant === 'outline' ? 'border border-gray-300' : 
      'bg-blue-500 text-white'
    } ${className}`}
  >
    {children}
  </button>
);

const Input = ({ value, onChange, className, type, min, max, placeholder, onKeyDown }) => (
  <input 
    type={type} 
    value={value} 
    onChange={onChange} 
    onKeyDown={onKeyDown}
    className={`border rounded px-2 py-1 ${className}`}
    min={min}
    max={max}
    placeholder={placeholder}
  />
);

const HabitTrackerDashboard = () => {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState('');
  const [pointsData, setPointsData] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingHabit, setEditingHabit] = useState(null);
  const [editingHabitName, setEditingHabitName] = useState('');
  const [draggedHabit, setDraggedHabit] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedHabitIndex, setSelectedHabitIndex] = useState(null);

  useEffect(() => {
    const calculatePointsData = () => {
      const data = habits.reduce((acc, habit) => {
        habit.completedDates.forEach(date => {
          const existingDate = acc.find(d => d.date === date);
          if (existingDate) {
            existingDate.points += habit.points;
          } else {
            acc.push({ date, points: habit.points });
          }
        });
        return acc;
      }, []);
      setPointsData(data.sort((a, b) => new Date(a.date) - new Date(b.date)));
    };

    calculatePointsData();
  }, [habits]);

  const addHabit = () => {
    if (newHabit.trim()) {
      setHabits([...habits, { name: newHabit, points: 1, completedDates: [], description: '' }]);
      setNewHabit('');
    }
  };

  const deleteHabit = (index) => {
    setHabits(habits.filter((_, i) => i !== index));
  };

  const toggleHabit = (habitIndex, date) => {
    const updatedHabits = [...habits];
    const habit = updatedHabits[habitIndex];
    const dateString = date.toISOString().split('T')[0];
    
    if (habit.completedDates.includes(dateString)) {
      habit.completedDates = habit.completedDates.filter(d => d !== dateString);
    } else {
      habit.completedDates.push(dateString);
    }
    
    setHabits(updatedHabits);
  };

  const updatePoints = (index, points) => {
    const updatedHabits = [...habits];
    updatedHabits[index].points = Math.max(1, Math.min(10, points));
    setHabits(updatedHabits);
  };

  const getDaysOfWeek = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentDate);
      day.setDate(currentDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const startEditingHabit = (index) => {
    setEditingHabit(index);
    setEditingHabitName(habits[index].name);
  };

  const handleEditHabit = (e) => {
    setEditingHabitName(e.target.value);
  };

  const finishEditingHabit = () => {
    if (editingHabit !== null) {
      const updatedHabits = [...habits];
      updatedHabits[editingHabit].name = editingHabitName.trim() || 'Unnamed Habit';
      setHabits(updatedHabits);
      setEditingHabit(null);
      setEditingHabitName('');
    }
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      finishEditingHabit();
    }
  };

  const handleDragStart = (index) => {
    setDraggedHabit(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedHabit === null) return;
    if (draggedHabit !== index) {
      const newHabits = [...habits];
      const [removed] = newHabits.splice(draggedHabit, 1);
      newHabits.splice(index, 0, removed);
      setHabits(newHabits);
      setDraggedHabit(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedHabit(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addHabit();
    }
  };

  const openHabitPage = (index) => {
    setSelectedHabitIndex(index);
    setCurrentView('habitPage');
  };

  const getHabitData = (habit) => {
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

  const updateHabitDescription = (index, description) => {
    const updatedHabits = [...habits];
    updatedHabits[index] = { ...updatedHabits[index], description };
    setHabits(updatedHabits);
  };

  const renderDashboard = () => (
    <div>
      <div className="mb-6 bg-white rounded shadow p-4">
        <h2 className="text-xl font-bold mb-4">Daily Points</h2>
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer>
            <LineChart data={pointsData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="points" stroke="#4CAF50" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex mb-4">
        <Input
          type="text"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Enter new habit"
          className="mr-2 flex-grow"
        />
        <Button onClick={addHabit} className="bg-green-500 text-white hover:bg-green-600">
          Add Habit
        </Button>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2 w-[40px]"></th>
            <th className="border p-2 w-[200px]">Habit</th>
            <th className="border p-2 w-[100px]">Points</th>
            {getDaysOfWeek().map((day, index) => (
              <th key={index} className="border p-2 text-center">{formatDate(day)}</th>
            ))}
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {habits.map((habit, habitIndex) => (
            <tr
              key={habitIndex}
              draggable
              onDragStart={() => handleDragStart(habitIndex)}
              onDragOver={(e) => handleDragOver(e, habitIndex)}
              onDragEnd={handleDragEnd}
              style={{ cursor: 'move' }}
            >
              <td className="border p-2">
                <GripVertical size={16} />
              </td>
              <td className="border p-2 flex items-center justify-between">
                {editingHabit === habitIndex ? (
                  <Input
                    type="text"
                    value={editingHabitName}
                    onChange={handleEditHabit}
                    onKeyDown={handleEditKeyDown}
                    onBlur={finishEditingHabit}
                    autoFocus
                    className="flex-grow mr-2"
                  />
                ) : (
                  <>
                    <span className="flex-grow">{habit.name}</span>
                    <div className="flex items-center">
                      <button onClick={() => startEditingHabit(habitIndex)} className="mr-2">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => openHabitPage(habitIndex)}>
                        <ExternalLink size={16} />
                      </button>
                    </div>
                  </>
                )}
              </td>
              <td className="border p-2">
                <Input
                  type="number"
                  value={habit.points}
                  onChange={(e) => updatePoints(habitIndex, parseInt(e.target.value))}
                  className="w-16"
                  min="1"
                  max="10"
                />
              </td>
              {getDaysOfWeek().map((day, dayIndex) => {
                const dateString = day.toISOString().split('T')[0];
                const isCompleted = habit.completedDates.includes(dateString);
                return (
                  <td key={dayIndex} className="border p-2 text-center">
                    <button
                      onClick={() => toggleHabit(habitIndex, day)}
                      className={`w-8 h-8 flex items-center justify-center border rounded ${isCompleted ? 'bg-green-500' : 'bg-white'}`}
                    >
                      {isCompleted && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="16px" height="16px">
                          <path d="M0 0h24v24H0z" fill="none"/>
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      )}
                    </button>
                  </td>
                );
              })}
              <td className="border p-2">
                <Button variant="destructive" onClick={() => deleteHabit(habitIndex)}>
                  <Trash2 size={16} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderHabitPage = () => {
    const habit = habits[selectedHabitIndex];
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <button onClick={() => setCurrentView('dashboard')} className="text-blue-500 hover:underline mb-4 flex items-center">
          <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold mb-4">{habit.name}</h1>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <textarea
            value={habit.description || ''}
            onChange={(e) => updateHabitDescription(selectedHabitIndex, e.target.value)}
            className="w-full p-2 border rounded"
            rows="4"
          />
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">30-Day Progress</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={getHabitData(habit)}>
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

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {currentView === 'dashboard' ? renderDashboard() : renderHabitPage()}
    </div>
  );
};

export default HabitTrackerDashboard;
