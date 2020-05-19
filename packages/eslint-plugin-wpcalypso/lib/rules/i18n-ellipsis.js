/**
 * @file Disallow using three dots in translate strings
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
	return ( fixer ) => {
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

const rule = ( module.exports = function ( context ) {
	return {
		CallExpression: function ( node ) {
			let argsToProcess = [];

			switch ( getCallee( node ).name ) {
				case 'translate':
					argsToProcess = node.arguments.slice( 0 );
					break;

				// We're only iterested in the first argument of these
				case '__':
				case '_x':
					argsToProcess = node.arguments.slice( 0, 1 );
					break;

				// Plural translate may have 2 translated strings
				case '_n':
				case '_nx':
					argsToProcess = node.arguments.slice( 0, 2 );
					break;
			}

			argsToProcess.forEach( function ( arg ) {
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
