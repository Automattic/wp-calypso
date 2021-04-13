const mergedMetaData = ( a, b ) => [
	...( a?.meta?.analytics ?? [] ),
	...( b?.meta?.analytics ?? [] ),
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
						...action?.meta,
						analytics: mergedMetaData( analytics, action ),
					},
				},
		  };

export const withAnalytics = ( ...args ) => {
	return args.length >= joinAnalytics.length
		? joinAnalytics( ...args )
		: ( ...args2 ) => withAnalytics( ...args.concat( args2 ) );
};
