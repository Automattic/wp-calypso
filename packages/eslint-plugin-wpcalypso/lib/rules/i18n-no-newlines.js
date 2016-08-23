/**
 * @fileoverview Disallow newlines in translatable strings.
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
				var string = getTextContentFromNode( arg );

				if ( ! string ) {
					return;
				}

				if ( -1 !== string.indexOf( '\n' ) ) {
					context.report( {
						node: arg,
						message: rule.ERROR_MESSAGE,
					} );
				}
			} );
		}
	};
};

rule.ERROR_MESSAGE = "Translations usually don't contain newlines";

rule.schema = [];
