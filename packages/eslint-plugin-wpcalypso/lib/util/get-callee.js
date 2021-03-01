/**
 * @file Utility for retrieving callee identifier node from a CallExpression
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

/**
 * Returns the callee identifier node from a CallExpression.
 *
 * @param  {object} node CallExpression node
 * @returns {object}      First non-sequence callee
 */
const getCallee = ( module.exports = function ( node ) {
	const callee = node.callee;
	if ( ! callee ) {
		return node;
	}

	if ( 'SequenceExpression' === callee.type ) {
		return getCallee( callee.expressions[ callee.expressions.length - 1 ] );
	}

	if ( 'MemberExpression' === callee.type ) {
		return getCallee( callee.property );
	}

	return callee;
} );
