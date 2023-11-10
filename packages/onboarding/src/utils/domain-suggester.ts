const validDomains = [
	'gmail.com',
	'yahoo.com',
	'hotmail.com',
	'aol.com',
	'outlook.com',
	'comcast.net',
	'icloud.com',
	'msn.com',
	'hotmail.co.uk',
	'sbcglobal.net',
];

export const extractDomainWithExtension = ( email: string ) => {
	if ( email ) {
		const atIndex = email.indexOf( '@' );
		if ( atIndex !== -1 ) {
			return email.slice( atIndex + 1 );
		}
	}
	return;
};

const replaceEmailDomain = ( email: string, newDomain: string | null ) => {
	if ( ! newDomain ) {
		return newDomain;
	}
	if ( email && newDomain ) {
		const atIndex = email.indexOf( '@' );
		if ( atIndex !== -1 ) {
			const username = email.substring( 0, atIndex );
			return username + '@' + newDomain;
		}
	}
	return email;
};

const calculateLevenshteinDistance = ( str1: string, str2: string ) => {
	const m = str1.length;
	const n = str2.length;
	const dp = Array.from( Array( m + 1 ), () => Array( n + 1 ).fill( 0 ) );

	for ( let i = 0; i <= m; i++ ) {
		dp[ i ][ 0 ] = i;
	}

	for ( let j = 0; j <= n; j++ ) {
		dp[ 0 ][ j ] = j;
	}

	for ( let i = 1; i <= m; i++ ) {
		for ( let j = 1; j <= n; j++ ) {
			if ( str1[ i - 1 ] === str2[ j - 1 ] ) {
				dp[ i ][ j ] = dp[ i - 1 ][ j - 1 ];
			} else {
				dp[ i ][ j ] = Math.min(
					dp[ i - 1 ][ j - 1 ] + 1, // substitution
					dp[ i ][ j - 1 ] + 1, // insertion
					dp[ i - 1 ][ j ] + 1 // deletion
				);

				if (
					i > 1 &&
					j > 1 &&
					str1[ i - 1 ] === str2[ j - 2 ] &&
					str1[ i - 2 ] === str2[ j - 1 ]
				) {
					dp[ i ][ j ] = Math.min( dp[ i ][ j ], dp[ i - 2 ][ j - 2 ] + 1 ); // transposition
				}
			}
		}
	}

	return dp[ m ][ n ];
};

export const suggestEmailCorrection = ( inputDomain: string ) => {
	const extractedInputEmailDomain = extractDomainWithExtension( inputDomain );

	if ( ! extractedInputEmailDomain || validDomains.includes( extractedInputEmailDomain ) ) {
		return;
	}

	const maxDistance = 2;
	let bestMatch = null;
	let bestMatchDistance = Infinity;

	// Iterate through each valid domain and calculate the Levenshtein distance
	for ( let i = 0; i < validDomains.length; i++ ) {
		const validDomain = validDomains[ i ];
		const distance = calculateLevenshteinDistance( extractedInputEmailDomain, validDomain );

		// If the distance is within the limit and better than the previous best match, update the suggestion
		if ( distance <= maxDistance && distance < bestMatchDistance ) {
			bestMatch = validDomain;
			bestMatchDistance = distance;
		}
	}

	return {
		original_domain: inputDomain,
		suggested_domain: replaceEmailDomain( inputDomain, bestMatch ),
		distance: bestMatchDistance,
	};
};
