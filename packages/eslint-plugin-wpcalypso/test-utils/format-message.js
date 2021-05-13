/**
 * @file Utility for replacing placeholders in eslint rule messages
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

/**
 * Given a message containing data terms, format the string using the specified
 * terms object.
 *
 * @see https://github.com/eslint/eslint/blob/v2.12.0/lib/eslint.js#L964-L971
 *
 * @param  {string} message Message template
 * @param  {object} terms   Terms
 * @returns {string}         Formatted message
 */
function formatMessage( message, terms ) {
	return message.replace( /\{\{\s*(.+?)\s*\}\}/g, function ( fullMatch, term ) {
		if ( terms.hasOwnProperty( term ) ) {
			return terms[ term ];
		}

		return fullMatch;
	} );
}

module.exports = formatMessage;
