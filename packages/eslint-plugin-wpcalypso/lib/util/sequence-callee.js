/**
 * @fileoverview Utility for retrieving first non-sequence callee from a CallExpression node
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

/**
 * Returns the first non-sequence callee from a CallExpression node.
 *
 * @param  {Object} node CallExpression node
 * @return {Object}      First non-sequence callee
 */
module.exports = function( node ) {
	var callee = node.callee;
	while ( 'SequenceExpression' === callee.type ) {
		callee = callee.expressions[ callee.expressions.length - 1 ];
	}

	return callee;
}
