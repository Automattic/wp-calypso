type SnakeToCamel< S extends string > = S extends `${ infer T }_${ infer U }`
	? `${ T }${ Capitalize< SnakeToCamel< U > > }`
	: S;

type ConvertToCamelCase< T > = T extends object
	? T extends Array< infer U >
		? Array< ConvertToCamelCase< U > >
		: {
				[ K in keyof T as SnakeToCamel< K & string > ]: ConvertToCamelCase< T[ K ] >;
		  }
	: T;

export function convertSnakeCaseToCamelCase< T >( obj: T ): ConvertToCamelCase< T > {
	if ( typeof obj !== 'object' || obj === null ) {
		return obj as ConvertToCamelCase< T >;
	}

	if ( Array.isArray( obj ) ) {
		return obj.map( ( item ) =>
			convertSnakeCaseToCamelCase( item )
		) as unknown as ConvertToCamelCase< T >;
	}

	const toCamelCase = ( str: string ) =>
		str.replace( /_([a-z])/g, ( _, letter ) => letter.toUpperCase() );

	const newObj: any = {};

	for ( const key in obj ) {
		if ( obj.hasOwnProperty( key ) ) {
			const camelCaseKey = toCamelCase( key );
			newObj[ camelCaseKey ] = convertSnakeCaseToCamelCase( obj[ key ] );
		}
	}

	return newObj as ConvertToCamelCase< T >;
}
