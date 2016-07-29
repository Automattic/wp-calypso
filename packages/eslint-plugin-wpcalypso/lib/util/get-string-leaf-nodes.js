/**
 * @fileoverview Utility for retrieving the nodes that contribute to the final
 string.
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

function getStringLeafNodes( node ) {
	if ( node.type === 'BinaryExpression' && node.operator === '+' ) {
		return getStringLeafNodes( node.left ).concat( getStringLeafNodes( node.right ) );
	}

	if ( node.type === 'Literal' && 'string' === typeof node.value ) {
		return [ node ];
	}

	// template literals are specced at https://github.com/babel/babylon/blob/master/ast/spec.md
	if ( node.type === 'TemplateLiteral' ) {
		return node.quasis;
	}

	return [];
}

 module.exports = getStringLeafNodes;
