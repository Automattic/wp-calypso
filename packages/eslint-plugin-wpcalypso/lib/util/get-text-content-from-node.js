/**
 * @file Utility for retrieving the final translatable string from an AST
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
 * @param  {object} node    A Literal, TemplateLiteral or BinaryExpression (+) node
 * @returns {string|boolean}   The concatenated string or the value false.
 */
function getTextContentFromNode( node ) {
	// We need to handle two cases:
	// TemplateLiteral quasis =>  node.value.raw
	// Literal strings => node.value
	// We don't need to handle TeplateLiterals with multiple quasis, because
	// we don't support expressions in literals.
	let left, right;

	if ( node.type === 'BinaryExpression' && node.operator === '+' ) {
		left = getTextContentFromNode( node.left );
		right = getTextContentFromNode( node.right );
		if ( left === false || right === false ) {
			return false;
		}
		return left + right;
	}

	if ( node.type === 'Literal' && 'string' === typeof node.value ) {
		return node.value;
	}

	// template literals are specced at https://github.com/babel/babylon/blob/master/ast/spec.md
	if ( node.type === 'TemplateLiteral' ) {
		return node.quasis
			.map( function ( quasis ) {
				return quasis.value.raw;
			} )
			.join( '' );
	}

	return false;
}

module.exports = getTextContentFromNode;
