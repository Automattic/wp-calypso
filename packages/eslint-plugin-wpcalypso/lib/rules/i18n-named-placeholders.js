/**
 * @fileoverview Disallow multiple unnamed placeholders
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */
'use strict';

var rule;

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------

// Regular expression adapted from sprintf.js. See CREDITS.md for license information.
var RX_PLACEHOLDERS = /(?:\x25\x25)|(\x25(?:(?:[1-9]\d*)\$|\((?:[^\)]+)\))?(?:\+)?(?:0|'[^$])?(?:-)?(?:\d+)?(?:\.(?:\d+))?(?:[b-fiosuxX]))/g;

//------------------------------------------------------------------------------
// Helper Functions
//------------------------------------------------------------------------------

var getCallee = require( '../util/get-callee' );

function hasUnqualifiedPlaceholders( string ) {
	var placeholders = string.match( RX_PLACEHOLDERS ) || [];
	if ( placeholders.length <= 1 ) {
		return false;
	}

	return placeholders.some( function( placeholder ) {
		return '%%' !== placeholder && ! placeholder.match( /[0-9()]/ );
	} );
}

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

rule = module.exports = function( context ) {
	return {
		CallExpression: function( node ) {
			var singular, plural;
			if ( 'translate' !== getCallee( node ).name ) {
				return;
			}

			// Find unqualified placeholders in singular
			singular = node.arguments[ 0 ].value;
			if ( 'string' === typeof singular && hasUnqualifiedPlaceholders( singular ) ) {
				context.report( node.arguments[ 0 ], rule.ERROR_MESSAGE );
				return;
			}

			// Done if no plural string exists
			if ( node.arguments.length <= 1 ) {
				return;
			}

			// Find unqualified placeholders in plural
			plural = node.arguments[ 1 ].value;
			if ( 'string' === typeof plural && hasUnqualifiedPlaceholders( plural ) ) {
				context.report( node.arguments[ 1 ], rule.ERROR_MESSAGE );
			}
		}
	};
};

rule.ERROR_MESSAGE = 'Multiple placeholders should be named';

rule.schema = [];
