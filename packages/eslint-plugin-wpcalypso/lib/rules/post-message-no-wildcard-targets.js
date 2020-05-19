/**
 * @file Disallow using the wildcard `*` in postMessage
 * @author Automattic
 * @copyright 2017 Automattic. All rights reserved.
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

const rule = ( module.exports = function ( context ) {
	return {
		CallExpression: function ( node ) {
			if ( 'postMessage' !== getCallee( node ).name ) {
				return;
			}

			if ( node.arguments.length < 2 ) {
				return;
			}

			const target = node.arguments[ 1 ];
			if ( '*' === getTextContentFromNode( target ) ) {
				context.report( node, rule.ERROR_MESSAGE );
			}
		},
	};
} );

rule.ERROR_MESSAGE = 'Always provide a specific targetOrigin, not *';

rule.schema = [];
