export function snakeCase< T >( obj: Record< string, T > ): Record< string, T > {
	return Object.keys( obj ).reduce( ( prev, key ) => {
		return convertAndMergeIfNotExisting( prev, key, obj[ key ] );
	}, {} );
}

function convertCamelKeyToSnake( key: string ): string {
	if ( key.length < 1 ) {
		return '';
	}
	if ( key.length < 2 ) {
		return key.toLowerCase();
	}
	const firstChar = key[ 0 ];
	const rest = key.slice( 1 );
	return (
		firstChar.toLowerCase() + rest.replace( /[A-Z]/g, ( capital ) => '_' + capital.toLowerCase() )
	);
}

function convertAndMergeIfNotExisting< T >(
	prev: Record< string, T >,
	key: string,
	value: T
): Record< string, T > {
	// Always prefer snake_case keys if they exist
	if ( /_/.test( key ) ) {
		return { ...prev, [ key.toLowerCase() ]: value };
	}
	const snakeKey = convertCamelKeyToSnake( key );
	// Do not overwrite a previous snake_case key
	if ( prev[ snakeKey ] ) {
		return prev;
	}
	return { ...prev, [ snakeKey ]: value };
}
