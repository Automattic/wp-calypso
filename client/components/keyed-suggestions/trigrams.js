export const trigrams = ( str ) => {
	const n = 3;
	const grams = [];
	const input = [ '_BEGIN_', ...str.split( '' ), '_END_' ];
	for ( let i = 0; i <= input.length - n; i++ ) {
		grams.push( input.slice( i, i + n ).join( '' ) );
	}
	return grams;
};

export const grams_to_lookup = ( gram_list ) => {
	const lookup = {};
	for ( const gram of gram_list ) {
		if ( gram in lookup ) {
			lookup[ gram ] += 1;
		} else {
			lookup[ gram ] = 1;
		}
	}
	return lookup;
};

export const lookup_to_magnitude = ( lookup ) => {
	if ( ! lookup || Object.keys( lookup ).length === 0 ) {
		return 0;
	}
	return Math.sqrt(
		Object.values( lookup )
			.map( ( x ) => x * x )
			.reduce( ( a, b ) => a + b )
	);
};

const string_to_lookup_cache = {};

export const string_to_lookup = ( str ) => {
	if ( str in string_to_lookup_cache ) {
		return string_to_lookup_cache[ str ];
	}
	const answer = grams_to_lookup( trigrams( str ) );
	string_to_lookup_cache[ str ] = answer;
	return answer;
};

export const dot_product = ( lookup1, lookup2 ) => {
	let value = 0;
	for ( const key of Object.keys( lookup1 ) ) {
		if ( key in lookup2 ) {
			value += lookup1[ key ] * lookup2[ key ];
		}
	}
	return value;
};

export const cosine_similarity = ( str1, str2 ) => {
	const l1 = string_to_lookup( str1 );
	const l2 = string_to_lookup( str2 );
	const denominator = lookup_to_magnitude( l1 ) * lookup_to_magnitude( l2 );
	if ( denominator === 0 ) {
		return 0;
	}
	return dot_product( l1, l2 ) / denominator;
};
