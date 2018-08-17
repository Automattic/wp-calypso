const HTTP_ACTION = '@@js-task/http';

export const http = ( {
	method = 'GET',
	url,
}) => ( {
	type: HTTP_ACTION,
	method,
	url,
} );

export const enhancer = next => ( ...args ) => {
	const store = next( ...args );
	const { dispatch } = store;

	const interceptor = action => {
		if ( action.type === HTTP_ACTION && action.meta && ! ( action.meta.data || action.meta.error ) ) {
			const xhr = new XMLHttpRequest();

			xhr.open( action.method, action.url );

			xhr.onload = () => dispatch( {
				...action,
				meta: {
					...action.meta,
					task: {
						...action.meta.task,
						data: xhr.responseText,
					}
				}
			} );

			xhr.onerror = () => dispatch( {
				...action,
				meta: {
					...action.meta,
					task: {
						...action.meta.task,
						error: xhr.responseText,
					}
				}
			} );

			xhr.send();
		}

		return dispatch( action );
	};

	return {
		...store,
		dispatch: interceptor,
	};
};
