/** @format */
const docblock = require( 'jest-docblock' );

/**
 * Test whether a text contains @format within its first docblock.
 *
 * @param   {String}  text The text to scan for the format keyword within the first docblock
 * @returns {boolean}      True if the first docblock contains @format keyword, otherwise false.
 */
function shouldFormat( text ) {
	return 'format' in docblock.parse( docblock.extract( text ) );
}

module.exports = shouldFormat;
