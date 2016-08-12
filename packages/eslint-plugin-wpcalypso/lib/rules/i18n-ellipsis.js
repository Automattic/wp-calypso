/**
 * @fileoverview Disallow using three dots in translate strings
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */
'use strict';

//------------------------------------------------------------------------------
// Helper Functions
//------------------------------------------------------------------------------

var getCallee = require( '../util/get-callee' ),
	getTextContentFromNode = require( '../util/get-text-content-from-node' );

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

var rule = module.exports = function( context ) {
	return {
		CallExpression: function( node ) {
			if ( 'translate' !== getCallee( node ).name ) {
				return;
			}

			node.arguments.forEach( function( arg ) {
				let argumentString = getTextContentFromNode( arg );
				if ( argumentString && -1 !== argumentString.indexOf( '...' ) ) {
					context.report( {
						node: arg,
						message: rule.ERROR_MESSAGE,
						fix: function( fixer ) {
							return fixer.replaceText( arg, argumentString.replace( /\.\.\./g, '…' ) );
						}
					} );
				}
			} );
		}
	};
};

rule.ERROR_MESSAGE = 'Use ellipsis character (…) in place of three dots';

rule.schema = [];
