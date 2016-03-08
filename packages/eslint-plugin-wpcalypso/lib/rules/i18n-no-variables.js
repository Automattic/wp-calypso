/**
 * @fileoverview Disallow variables as translate strings
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */
'use strict';

//------------------------------------------------------------------------------
// Helper Functions
//------------------------------------------------------------------------------

var getSequenceCallee = require( '../util/sequence-callee' );

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

var rule = module.exports = function( context ) {
	function isAcceptableLiteralNode( node ) {
		if ( 'BinaryExpression' === node.type ) {
			return '+' === node.operator &&
				isAcceptableLiteralNode( node.left ) &&
				isAcceptableLiteralNode( node.right );
		}

		return 'Literal' === node.type;
	}

	return {
		CallExpression: function( node ) {
			var options;
			if ( 'translate' !== getSequenceCallee( node ).name ) {
				return;
			}

			node.arguments.forEach( function( arg, i ) {
				// Ignore last argument in multi-argument translate call, which
				// should be the object argument
				if ( i === node.arguments.length - 1 && node.arguments.length > 1 ) {
					return;
				}

				if ( ! isAcceptableLiteralNode( arg ) ) {
					context.report( arg, rule.ERROR_MESSAGE );
				}
			} );

			// Done if no options
			options = node.arguments[ node.arguments.length - 1 ];
			if ( ! options || options.type !== 'ObjectExpression' ) {
				return;
			}

			// Verify that context and comment are non-variable
			options.properties.forEach( function( property ) {
				var key = property.key.name;
				if ( key !== 'context' && key !== 'comment' ) {
					return;
				}

				if ( ! isAcceptableLiteralNode( property.value ) ) {
					context.report( property.value, rule.ERROR_MESSAGE );
				}
			} );
		}
	};
};

rule.ERROR_MESSAGE = 'Variables cannot be used as translate strings';

rule.schema = [];
