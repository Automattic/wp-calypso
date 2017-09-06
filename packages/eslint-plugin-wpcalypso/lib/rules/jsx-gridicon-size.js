/**
 * @fileoverview Enforce recommended Gridicon size attributes
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */
'use strict';

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------

var VALID_SIZES = [ 12, 18, 24, 36, 48, 54, 72 ];

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

var rule = module.exports = function( context ) {
	return {
		JSXAttribute: function( node ) {
			if ( 'size' !== node.name.name ||
					'JSXOpeningElement' !== node.parent.type ||
					'Gridicon' !== node.parent.name.name ||
					'JSXExpressionContainer' !== node.value.type ||
					'Literal' !== node.value.expression.type ) {
				return;
			}

			if ( -1 === VALID_SIZES.indexOf( node.value.expression.value ) ) {
				context.report( node, rule.ERROR_MESSAGE );
			}
		},
	};
};

rule.ERROR_MESSAGE = 'Gridicon size should be one of recommended sizes: ' + VALID_SIZES.join( ', ' );

rule.schema = [];
