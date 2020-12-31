const DEFAULT_STATE = {};

const reducer = ( state = DEFAULT_STATE, action ) => {
	switch ( action.type ) {
		case 'TOGGLE_OPTION':
			return {
				...state,
				[ action.option ]: state[ action.option ] ? ! state[ action.option ] : true,
			};
	}

	return state;
};

export default reducer;
