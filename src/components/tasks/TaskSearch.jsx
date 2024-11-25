const TaskSearch = ({ value, onChange }) => {
    return (
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search tasks..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
        />
      </div>
    );
  };
  
  export default TaskSearch;