const DELAY_ACTION = '@@js-task/delay';

export const delayAction = ( after, action ) => ( {
	type: DELAY_ACTION,
	action,
	after,
} );

export const enhancer = next => ( ...args ) => {
	const store = next( ...args );
	const { dispatch } = store;

	const interceptor = ( { action } ) => {
		if ( action.type === DELAY_ACTION ) {
			setTimeout( () => {
				dispatch( {
					...action,
					meta: {
						...action.meta,
						task: {
							data: dispatch( action.action ),
						}
					}
				} )
			}, action.after );
		}

		return dispatch( action );
	};

	return {
		...store,
		dispatch: interceptor,
	};
};
