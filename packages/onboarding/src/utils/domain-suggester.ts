// Taken from: https://www.gmass.co/domains
// These cover ~88% of email addresses.
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

const extractDomainWithExtension = ( email: string ) => {
	if ( email ) {
		email = email.toLowerCase();
		const atIndex = email.indexOf( '@' );
		if ( atIndex !== -1 ) {
			return email.slice( atIndex + 1 );
		}
	}
	return;
};

const replaceEmailDomain = ( email: string, newDomain: string ) => {
	if ( email && newDomain ) {
		email = email.toLowerCase();
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

export const suggestEmailCorrection = ( inputDomain: string, maxDistance = 2 ) => {
	const extractedInputEmailDomain = extractDomainWithExtension( inputDomain );

	let bestMatch = null;
	let bestMatchDistance = Infinity;

	if ( extractedInputEmailDomain && ! validDomains.includes( extractedInputEmailDomain ) ) {
		// Iterate through each valid domain and calculate the Levenshtein distance
		const maxDistance = 2;
		for ( let i = 0; i < validDomains.length; i++ ) {
			const validDomain = validDomains[ i ];
			const distance = calculateLevenshteinDistance( extractedInputEmailDomain, validDomain );

			// If the distance is within the limit and better than the previous best match, update the suggestion
			if ( distance <= maxDistance && distance < bestMatchDistance ) {
				bestMatch = validDomain;
				bestMatchDistance = distance;
			}
		}
	}

	return {
		oldEmail: inputDomain,
		oldDomain: extractedInputEmailDomain,
		newDomain: bestMatch,
		newEmail: replaceEmailDomain( inputDomain, bestMatch ),
		distance: bestMatchDistance,
		wasCorrected: bestMatch !== null,
	};
};
