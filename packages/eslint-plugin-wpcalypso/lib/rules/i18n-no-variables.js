/**
 * @file Disallow variables as translate strings
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------

const VERIFY_OPTION_LITERALS = [ 'context', 'comment', 'original', 'single', 'plural' ];

//------------------------------------------------------------------------------
// Helper Functions
//------------------------------------------------------------------------------

const getCallee = require( '../util/get-callee' );

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const rule = ( module.exports = function ( context ) {
	function isAcceptableLiteralNode( node ) {
		if ( 'BinaryExpression' === node.type ) {
			return (
				'+' === node.operator &&
				isAcceptableLiteralNode( node.left ) &&
				isAcceptableLiteralNode( node.right )
			);
		}

		if ( 'TemplateLiteral' === node.type ) {
			// Backticks are fine, but if there's any interpolation in it,
			// that's a problem
			return node.expressions.length === 0;
		}

		return 'Literal' === node.type;
	}

	function validateOptions( options ) {
		return options.properties.every( function ( property ) {
			const key = property.key.name;

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
		CallExpression: function ( node ) {
			if ( 'translate' !== getCallee( node ).name ) {
				return;
			}

			node.arguments.forEach( function ( arg, i ) {
				const isLastArgument = i === node.arguments.length - 1;

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
			const options = node.arguments[ node.arguments.length - 1 ];
			if ( options && options.type === 'ObjectExpression' ) {
				validateOptions( options );
			}
		},
	};
} );

rule.ERROR_MESSAGE = 'Variables cannot be used in translatable strings';

rule.schema = [];
