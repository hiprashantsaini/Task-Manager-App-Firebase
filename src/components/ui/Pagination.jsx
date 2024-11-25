const Pagination = ({ onLoadMore, loading }) => {
    return (
      <div className="flex justify-center mt-4">
        <button
          onClick={onLoadMore}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Load More'}
        </button>
      </div>
    );
  };
  
  export default Pagination;