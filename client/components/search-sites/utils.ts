const matches = < T >( item: T, term: string, keys: ( keyof T )[] ) =>
	keys.some( ( key ) => {
		const value = item[ key ];

		if ( ! value || typeof value !== 'string' ) {
			return false;
		}

		return value.toLowerCase().indexOf( term ) > -1;
	} );

export const searchCollection = < T >( collection: T[], term: string, keys: ( keyof T )[] ) =>
	collection.filter( ( item ) => item && matches( item, term, keys ) );
