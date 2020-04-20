/**
 * @file Disallow strings which include only placeholders
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------

// Regular expression adapted from sprintf.js. See CREDITS.md for license information.
const RX_PLACEHOLDERS = /(?:\x25\x25)|(\x25(?:(?:[1-9]\d*)\$|\((?:[^\)]+)\))?(?:\+)?(?:0|'[^$])?(?:-)?(?:\d+)?(?:\.(?:\d+))?(?:[b-fiosuxX]))/g; // eslint-disable-line max-len
const RX_INTERPOLATED_COMPONENTS = /(\{\{\/?\s*\w+\s*\/?\}\})/g;

//------------------------------------------------------------------------------
// Helper Functions
//------------------------------------------------------------------------------

const getCallee = require( '../util/get-callee' ),
	getTextContentFromNode = require( '../util/get-text-content-from-node' );

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const rule = ( module.exports = function ( context ) {
	return {
		CallExpression: function ( node ) {
			if ( 'translate' !== getCallee( node ).name ) {
				return;
			}

			node.arguments.forEach( function ( arg ) {
				let value = getTextContentFromNode( arg );
				if ( 'string' !== typeof value ) {
					return;
				}

				value = value.replace( RX_PLACEHOLDERS, '' );
				if ( 0 === value.length ) {
					context.report( arg, rule.ERROR_MESSAGE );
					return;
				}

				value = value.replace( RX_INTERPOLATED_COMPONENTS, '' );
				if ( 0 === value.length ) {
					context.report( arg, rule.ERROR_MESSAGE );
				}
			} );
		},
	};
} );

rule.ERROR_MESSAGE = "We shouldn't translate strings that are entirely placeholder";

rule.schema = [];
