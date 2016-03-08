/**
 * @fileoverview Disallow variables as translate strings
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */
'use strict';

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------

var VERIFY_OPTION_LITERALS = [ 'context', 'comment', 'original', 'single', 'plural' ];

//------------------------------------------------------------------------------
// Helper Functions
//------------------------------------------------------------------------------

var getCallee = require( '../util/get-callee' );

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

	function validateOptions( options ) {
		return options.properties.every( function( property ) {
			var key = property.key.name;

			// `options.original` can be a string value to be validated in this
			// block, or as an object should validate its nested single and
			// plural keys
			if ( property.value.type === 'ObjectExpression' && 'original' === key ) {
				validateOptions( property.value );
				return;
			}

			// Skip keys which we are not concerned with
			if ( -1 === VERIFY_OPTION_LITERALS.indexOf( key ) ) {
				return;
			}

			if ( ! isAcceptableLiteralNode( property.value ) ) {
				context.report( property.value, rule.ERROR_MESSAGE );
			}
		} );
	}

	return {
		CallExpression: function( node ) {
			var options;
			if ( 'translate' !== getCallee( node ).name ) {
				return;
			}

			node.arguments.forEach( function( arg, i ) {
				var isLastArgument = i === node.arguments.length - 1;

				// Ignore last argument in multi-argument translate call, which
				// should be the object argument
				if ( isLastArgument && node.arguments.length > 1 ) {
					return;
				}

				// Ignore ObjectExpression-only invocation, as it is valid to
				// call translate with object options
				if ( isLastArgument && 'ObjectExpression' === arg.type ) {
					return;
				}

				if ( ! isAcceptableLiteralNode( arg ) ) {
					context.report( arg, rule.ERROR_MESSAGE );
				}
			} );

			// Verify that option literals are not variables
			options = node.arguments[ node.arguments.length - 1 ];
			if ( options && options.type === 'ObjectExpression' ) {
				validateOptions( options );
			}
		}
	};
};

rule.ERROR_MESSAGE = 'Variables cannot be used as translate strings';

rule.schema = [];
