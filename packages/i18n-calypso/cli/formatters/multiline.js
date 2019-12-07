/** @format */

const MAX_COLUMNS = 79;
const SEPARATORS = [ ' ', '/', ',', ';' ];

/**
 * Split a string literal into multiple lines
 * Ex:
 * input: '"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."'
 * output:
 * '""
 * "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod "
 * "tempor incididunt ut labore et dolore magna aliqua."
 *
 * @param {string} literal      - A string literal
 * @param {string|int} startAt  - A prefix (or the negative length of the prefix) the literal will be printed at
 * @return {string}             - A multiline string compatible with the POT format
 */
module.exports = function multiline( literal, startAt ) {
	const maxPosition = MAX_COLUMNS - 1; // MAX_COLUMNS minus the last character needed for closing string (a ");

	let nextSpaceIndex, i, char;

	if ( typeof startAt === 'string' ) {
		startAt = -startAt.length;
	} else if ( startAt === undefined ) {
		startAt = -6;
	}

	// Remove line break in trailing backslash syntax.
	literal = literal.replace( /\\\\\n/g, '' );
	// Convert regular line breaks to \n notation.
	literal = literal.replace( /\n/g, '\\n' );

	if ( literal.length <= startAt + MAX_COLUMNS ) {
		return literal.substr( startAt > 0 ? startAt : 0 );
	}

	if ( startAt < 0 ) {
		return '""\n' + multiline( literal, 0 );
	}

	for ( i = startAt + maxPosition - 1; i > startAt; i-- ) {
		char = literal.charAt( i );
		if ( SEPARATORS.indexOf( char ) !== -1 ) {
			nextSpaceIndex = i;
			break;
		}
	}

	// we encountered a very long word, look to the right
	if ( ! nextSpaceIndex ) {
		for ( i = startAt + maxPosition; i < literal.length - 1; i++ ) {
			char = literal.charAt( i );
			if ( SEPARATORS.indexOf( char ) !== -1 ) {
				nextSpaceIndex = i;
				break;
			}
		}
	}

	// we encountered a line without separators, don't break it
	if ( i === literal.length - 1 ) {
		return literal;
	}

	return (
		literal.substring( startAt, nextSpaceIndex + 1 ) +
		'"\n' +
		multiline( '"' + literal.substr( nextSpaceIndex + 1 ), 0 )
	);
};
