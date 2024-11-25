import { collection, getDocs, limit, onSnapshot, orderBy, query, startAfter } from 'firebase/firestore';
import { useContext, useEffect, useRef, useState } from 'react';
import { TaskContext } from '../../context/TaskContext';
import { db } from '../../services/firebase';
import LoadingSpinner from '../ui/LoadingSpinner';
import Pagination from '../ui/Pagination';
import TaskForm from './TaskForm';
import TaskItem from './TaskItem';
import TaskSearch from './TaskSearch';

const TASKS_PER_PAGE = 10;

const TaskList = () => {
  const { state, dispatch } = useContext(TaskContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const unsubscribeRef = useRef(null);

  const handleRealtimeUpdates = (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const taskData = { id: change.doc.id, ...change.doc.data() };

      if (change.type === 'modified') {
        dispatch({
          type: 'UPDATE_TASK',
          payload: taskData
        });
      } 
      else if (change.type === 'removed') {
        dispatch({
          type: 'DELETE_TASK',
          payload: taskData.id
        });
      }
    });
  };
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const tasksRef = collection(db, 'tasks');
      const q = query(
        tasksRef,
        orderBy('createdAt', 'desc'),
        limit(TASKS_PER_PAGE)
      );
      
      const snapshot = await getDocs(q);
      const tasks = [];
      snapshot.forEach(doc => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
      
      dispatch({ type: 'SET_TASKS', payload: tasks });
      // Only set lastVisible if we have documents
      setLastVisible(snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1] : null);
      setHasMore(snapshot.docs.length === TASKS_PER_PAGE);
      // Set up real-time listener only for the current visible tasks
      const visibleTaskIds = new Set(tasks.map(task => task.id));
      const realtimeQuery = query(
        tasksRef,
        orderBy('createdAt', 'desc')
      );

      const unsub = onSnapshot(realtimeQuery, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const taskData = { id: change.doc.id, ...change.doc.data() };

          if (change.type === 'added') {
            // Only handle updates for tasks we're already displaying
            if (visibleTaskIds.has(taskData.id)) {
              dispatch({
                type: 'UPDATE_TASK',
                payload: taskData
              });
            }
          } else {
            handleRealtimeUpdates({ docChanges: () => [change] });
          }
        });
      }, (err) => {
        setError('Failed to sync tasks');
        console.error(err);
      });

      unsubscribeRef.current = unsub;
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const loadMore = async () => {
    if (!lastVisible) return;
    
    try {
      const tasksRef = collection(db, 'tasks');
      const q = query(
        tasksRef,
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(TASKS_PER_PAGE)
      );
      
      const snapshot = await getDocs(q);
      const newTasks = [];
      snapshot.forEach(doc => {
        newTasks.push({ id: doc.id, ...doc.data() });
      });
      
      dispatch({ type: 'SET_TASKS', payload: [...state.tasks, ...newTasks] });
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === TASKS_PER_PAGE);
    } catch (err) {
      setError('Failed to load more tasks');
      console.error(err);
    }
  };

  const refreshTasks = async () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }
    dispatch({ type: 'SET_TASKS', payload: [] });
    await fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const filteredTasks = state.tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !state.tasks.length) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <TaskForm />
      <div className="flex justify-between items-center">
        <TaskSearch value={searchTerm} onChange={setSearchTerm} />
        <button
          onClick={refreshTasks}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        {filteredTasks.map(task => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>
      
      {hasMore && !loading && (
        <Pagination onLoadMore={loadMore} loading={loading} />
      )}
    </div>
  );
};

export default TaskList;