/** @format */
/**
 * @fileoverview Disallow using three dots in translate strings
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Helper Functions
//------------------------------------------------------------------------------

const getCallee = require( '../util/get-callee' ),
	getTextContentFromNode = require( '../util/get-text-content-from-node' );

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

function containsThreeDots( string ) {
	return -1 !== string.indexOf( '...' );
}

function replaceThreeDotsWithEllipsis( string ) {
	return string.replace( /\.\.\./g, '…' );
}

function makeFixerFunction( arg ) {
	return fixer => {
		switch ( arg.type ) {
			case 'TemplateLiteral':
				return arg.quasis.reduce( ( fixes, quasi ) => {
					if ( 'TemplateElement' === quasi.type && containsThreeDots( quasi.value.raw ) ) {
						fixes.push(
							fixer.replaceTextRange(
								[ quasi.start, quasi.end ],
								replaceThreeDotsWithEllipsis( quasi.value.raw )
							)
						);
					}
					return fixes;
				}, [] );

			case 'Literal':
				return [ fixer.replaceText( arg, replaceThreeDotsWithEllipsis( arg.raw ) ) ];

			case 'BinaryExpression':
				return [
					...makeFixerFunction( arg.left )( fixer ),
					...makeFixerFunction( arg.right )( fixer ),
				];
		}
	};
}

const rule = ( module.exports = function( context ) {
	return {
		CallExpression: function( node ) {
			if ( 'translate' !== getCallee( node ).name ) {
				return;
			}

			node.arguments.forEach( function( arg ) {
				const argumentString = getTextContentFromNode( arg );
				if ( argumentString && containsThreeDots( argumentString ) ) {
					context.report( {
						node: arg,
						message: rule.ERROR_MESSAGE,
						fix: makeFixerFunction( arg ),
					} );
				}
			} );
		},
	};
} );

rule.ERROR_MESSAGE = 'Use ellipsis character (…) in place of three dots';

rule.schema = [];
