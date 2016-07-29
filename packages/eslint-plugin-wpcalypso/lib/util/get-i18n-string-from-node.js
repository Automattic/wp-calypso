/**
 * @fileoverview Utility for retrieving the final translatable string from an AST
 * node for tests that focus on the strings themselves.
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

/**
 * Approximates the string that the i18n system will process, by abstracting
 * away the difference between TemplateLiteral and Literal strings and
 * processing literal string concatenation.
 *
 * Note that TemplateLiterals with expressions are not supported, because
 * they don't work in our translation system.
 *
 * @param  {Object} node A Literal, TemplateLiteral or BinaryExpression (+) node
 * @return String   The concatenated string.
 */
var getStringLeafNodes = require( './get-string-leaf-nodes' );

function getI18nStringFromNode( node ) {
	// We need to handle two cases:
	// TemplateLiteral quasis =>  node.value.raw
	// Literal strings => node.value
	// We don't need to handle TeplateLiterals with multiple quasis, because
	// we don't support expressions in literals.
	return getStringLeafNodes( node )
		.map( function( leaf ) {
			return leaf.value.raw || leaf.value;
		} )
		.join( '' );
}

 module.exports = getI18nStringFromNode;
