/**
 * @file Enforce recommended Gridicon size attributes
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------

const VALID_SIZES = [ 12, 18, 24, 36, 48, 54, 72 ];

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const rule = ( module.exports = function ( context ) {
	return {
		JSXAttribute: function ( node ) {
			if (
				'size' !== node.name.name ||
				'JSXOpeningElement' !== node.parent.type ||
				'Gridicon' !== node.parent.name.name ||
				'JSXExpressionContainer' !== node.value.type ||
				'Literal' !== node.value.expression.type
			) {
				return;
			}

			if ( ! VALID_SIZES.includes( node.value.expression.value ) ) {
				context.report( node, rule.ERROR_MESSAGE );
			}
		},
	};
} );

rule.ERROR_MESSAGE =
	'Gridicon size should be one of recommended sizes: ' + VALID_SIZES.join( ', ' );

rule.schema = [];
