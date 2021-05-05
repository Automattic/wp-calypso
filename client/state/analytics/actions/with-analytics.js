const mergedMetaData = ( a, b ) => [
	...( a.meta?.analytics ?? [] ),
	...( b.meta?.analytics ?? [] ),
];

const joinAnalytics = ( analytics, action ) =>
	typeof action === 'function'
		? ( dispatch ) => {
				dispatch( analytics );
				dispatch( action );
		  }
		: {
				...action,
				...{
					meta: {
						...action.meta,
						analytics: mergedMetaData( analytics, action ),
					},
				},
		  };

export function withAnalytics( analytics, action ) {
	if ( typeof action === 'undefined' ) {
		return ( a ) => joinAnalytics( analytics, a );
	}

	return joinAnalytics( analytics, action );
}
