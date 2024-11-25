import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useContext, useState } from 'react';
import { TaskContext } from '../../context/TaskContext';
import { db } from '../../services/firebase';

const TaskItem = ({ task }) => {
  const { dispatch } = useContext(TaskContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const handleUpdate = async () => {
    setLoading(true);
    setError('');
    if (!editTitle.trim()) {
      setError('Task title cannot be empty.');
      setLoading(false);
      return;
    }
    try {
      const taskRef = doc(db, 'tasks', task.id);
      const updatedTask = {
        ...task,
        title: editTitle,
        description: editDescription,
      };
      
      await updateDoc(taskRef, updatedTask);
      dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
      setIsEditing(false);
    } catch (err) {
      switch (err.code) {
        case 'permission-denied':
          setError('You do not have permission to update tasks.');
          break;
        case 'not-found':
          setError('Task not found. It might have been deleted already.');
          break;
        case 'unavailable':
          setError('Firestore service is currently unavailable. Please try again later.');
          break;
        default:
          setError('Failed to update task. Please try again later.');
      }
      console.error('Update error:', err.code, err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    setLoading(true);
    setError('');
    try {
      await deleteDoc(doc(db, 'tasks', task.id));
      dispatch({ type: 'DELETE_TASK', payload: task.id });
    } catch (err) {
      switch (err.code) {
        case 'permission-denied':
          setError('You do not have permission to delete tasks.');
          break;
        case 'not-found':
          setError('Task not found. It might have been deleted already.');
          break;
        case 'unavailable':
          setError('Firestore service is currently unavailable. Please try again later.');
          break;
        default:
          setError('Failed to delete task. Please try again later.');
      }
      console.error('Delete error:', err.code, err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async () => {
    try {
      const taskRef = doc(db, 'tasks', task.id);
      const updatedTask = {
        ...task,
        completed: !task.completed,
      };
      
      await updateDoc(taskRef, updatedTask);
      dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
    } catch (err) {
      switch (err.code) {
        case 'permission-denied':
          setError('You do not have permission to update task status.');
          break;
        case 'not-found':
          setError('Task not found. It might have been deleted already.');
          break;
        case 'unavailable':
          setError('Firestore service is currently unavailable. Please try again later.');
          break;
        default:
          setError('Failed to toggle task completion. Please try again later.');
      }
      console.error('Toggle completion error:', err.code, err.message);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg mb-2"
          placeholder="Task Title"
        />
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg mb-2"
          rows="2"
          placeholder="Task Description"
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row items-start sm:items-center justify-between ${task.completed ? 'opacity-75' : ''}`}>
      <div className="w-full flex items-center space-x-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleToggleComplete}
          className="mt-1 cursor-pointer"
        />
        <div className='w-[95%]'>
          <h3 className={`font-semibold text-justify text-balance p-1 ${task.completed ? 'line-through' : ''}`}>{task.title}</h3>
          <p className="text-gray-600 text-justify p-1 mt-1 text-sm">{task.description}</p>
        </div>
      </div>
      <div className="flex space-x-3 mt-2 sm:mt-0">
        <button
          onClick={() => setIsEditing(true)}
          className="text-blue-500 hover:text-blue-600"
          disabled={loading}
        >
          <PencilSquareIcon className="h-5 w-5" />
        </button>
        <button
          onClick={handleDelete}
          className="text-red-500 hover:text-red-600"
          disabled={loading}
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default TaskItem;