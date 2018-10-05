/** @format */

export const asyncWrapper = base => ( {
	length: () => Promise.resolve( base.length ),
	key: n => Promise.resolve( base.key( n ) ),
	getItem: key => Promise.resolve( base.getItem( key ) ),
	setItem: ( key, value ) => Promise.resolve( base.setItem( key, value ) ),
	removeItem: key => Promise.resolve( base.removeItem( key ) ),
	clear: () => Promise.resolve( base.clear() ),
} );

export const load = ( storageAPI, keyPrefix ) =>
	storageAPI
		.length()
		.then( length => {
			const reads = [];

			for ( let i = 0; i < length; i++ ) {
				reads.push(
					storageAPI
						.key( i )
						.then( key => storageAPI.getItem( key ).then( value => [ key, value ] ) )
				);
			}

			return Promise.race( reads );
		} )
		.then( items =>
			items.reduce(
				( state, [ path, substate ] ) =>
					path.startsWith( keyPrefix ) ? { ...state, [ path ]: substate } : state,
				{}
			)
		);

export const registerReducer = ( storedState, reducers ) => ( path, reducer ) => {
	reducers[ path ] = reducer;
	storedState[ path ] = storedState.hasOwnProperty( path )
		? reducer( storedState[ path ], 'DESERIALIZE' )
		: reducer( undefined, '@@INIT' );
};

export const reducer = ( storageAPI, keyPrefix, storedState, reducers ) => ( state, action ) =>
	Object.keys( reducers ).reduce( ( [ nextState, hadChanges ], path ) => {
		const prev = state[ path ] || storedState[ path ];
		const next = reducers[ path ]( prev, action );
		const hasChange = prev !== next;
		const hasChanges = hadChanges || hasChange;

		if ( hasChange ) {
			storageAPI.setItem( path, reducers[ keyPrefix + path ]( next, 'SERIALIZE' ) );
		}

		return hasChanges
			? [ { ...nextState, [ path ]: next }, hasChanges ]
			: [ storedState, hasChanges ];
	} )[ 0 ];

export const createDynamicReducer = ( { storageAPI, keyPrefix } ) =>
	load( storageAPI, keyPrefix ).then( ( storedState, reducers = {} ) => ( {
		registerReducer: registerReducer( storedState, reducers ),
		reducer: reducer( storageAPI, keyPrefix, storedState, reducers ),
	} ) );
