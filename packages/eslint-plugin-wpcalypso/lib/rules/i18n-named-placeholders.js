/**
 * @file Disallow multiple unnamed placeholders
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------

// Regular expression adapted from sprintf.js. See CREDITS.md for license information.
const RX_PLACEHOLDERS = /(?:\x25\x25)|(\x25(?:(?:[1-9]\d*)\$|\((?:[^\)]+)\))?(?:\+)?(?:0|'[^$])?(?:-)?(?:\d+)?(?:\.(?:\d+))?(?:[b-fiosuxX]))/g; // eslint-disable-line max-len

//------------------------------------------------------------------------------
// Helper Functions
//------------------------------------------------------------------------------

const getCallee = require( '../util/get-callee' ),
	getTextContentFromNode = require( '../util/get-text-content-from-node' );

function hasUnqualifiedPlaceholders( string ) {
	const placeholders = string.match( RX_PLACEHOLDERS ) || [];
	if ( placeholders.length <= 1 ) {
		return false;
	}

	return placeholders.some( function ( placeholder ) {
		return '%%' !== placeholder && ! placeholder.match( /[0-9()]/ );
	} );
}

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const rule = ( module.exports = function ( context ) {
	return {
		CallExpression: function ( node ) {
			// Done if no args are passed
			if ( node.arguments.length === 0 ) {
				return;
			}

			if ( 'translate' !== getCallee( node ).name ) {
				return;
			}

			// Find unqualified placeholders in singular
			const singular = getTextContentFromNode( node.arguments[ 0 ] );
			if ( 'string' === typeof singular && hasUnqualifiedPlaceholders( singular ) ) {
				context.report( node.arguments[ 0 ], rule.ERROR_MESSAGE );
				return;
			}

			// Done if no plural string exists
			if ( node.arguments.length <= 1 ) {
				return;
			}

			// Find unqualified placeholders in plural
			const plural = getTextContentFromNode( node.arguments[ 1 ] );
			if ( 'string' === typeof plural && hasUnqualifiedPlaceholders( plural ) ) {
				context.report( node.arguments[ 1 ], rule.ERROR_MESSAGE );
			}
		},
	};
} );

rule.ERROR_MESSAGE = 'Multiple placeholders should be named';

rule.schema = [];
