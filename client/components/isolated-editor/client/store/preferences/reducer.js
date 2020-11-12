/**
 * WordPress dependencies
 */

const reducer = ( state, action ) => {
	switch ( action.type ) {
		case 'TOGGLE_FEATURE':
			return {
				...state,
				[ action.feature ]: state[ action.feature ] ? ! state[ action.feature ] : true,
			};
	}

	return state;
};

export default reducer;
