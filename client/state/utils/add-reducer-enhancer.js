export const addReducerEnhancer = nextCreator => ( reducer, initialState ) => {
	const nextStore = nextCreator( reducer, initialState );

	let currentReducer = reducer;
	function addReducer( keys, subReducer ) {
		currentReducer = currentReducer.addReducer( keys, subReducer );
		this.replaceReducer( currentReducer );
	}

	function getCurrentReducer() {
		return currentReducer;
	}

	return { ...nextStore, addReducer, getCurrentReducer };
};
