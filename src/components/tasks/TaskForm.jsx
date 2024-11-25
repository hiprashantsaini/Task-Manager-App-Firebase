import { addDoc, collection } from 'firebase/firestore';
import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { TaskContext } from '../../context/TaskContext';
import { db } from '../../services/firebase';

const TaskForm = () => {
  const { dispatch } = useContext(TaskContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const {user}=useContext(AuthContext);

  // console.log("User :",user.uid);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const taskRef = collection(db, 'tasks');
      const newTask = {
        userId:user.uid,
        title,
        description,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      
      const docRef = await addDoc(taskRef, newTask);
      dispatch({ 
        type: 'ADD_TASK', 
        payload: { id: docRef.id, ...newTask } 
      });
      
      // Reset form
      setTitle('');
      setDescription('');
    } catch (err) {
        // Customize error messages based on Firestore error codes
        switch (err.code) {
          case 'permission-denied':
            setError('You do not have permission to create tasks.');
            break;
          case 'unavailable':
            setError('Firestore service is currently unavailable. Please try again later.');
            break;
          case 'invalid-argument':
            setError('Invalid data provided. Please check your inputs.');
            break;
          case 'deadline-exceeded':
            setError('Request took too long. Please check your network connection.');
            break;
          default:
            setError('Failed to create task. Please try again later.');
        }
        console.error("task creation error:", err.code, err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Add New Task</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
          rows="3"
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Add Task'}
      </button>
    </form>
  );
};

export default TaskForm;
