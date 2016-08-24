/**
 * @fileoverview Ensure placeholder counts match between singular and plural strings
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */
'use strict';

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------

// Regular expression adapted from sprintf.js. See CREDITS.md for license information.
var RX_PLACEHOLDERS = /(?:\x25\x25)|(\x25(?:(?:[1-9]\d*)\$|\((?:[^\)]+)\))?(?:\+)?(?:0|'[^$])?(?:-)?(?:\d+)?(?:\.(?:\d+))?(?:[b-fiosuxX]))/g; // eslint-disable-line max-len

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
			var singular, plural, singularMatch, pluralMatch;
			if ( 'translate' !== getCallee( node ).name ) {
				return;
			}

			// Only consider translate calls with plurals specified
			if ( node.arguments.length !== 3 ) {
				return;
			}

			singular = getTextContentFromNode( node.arguments[ 0 ] );
			plural = getTextContentFromNode( node.arguments[ 1 ] );

			// Ignore invalid arguments
			if ( 'string' !== typeof singular || 'string' !== typeof plural ) {
				return;
			}

			singularMatch = singular.match( RX_PLACEHOLDERS );
			pluralMatch = plural.match( RX_PLACEHOLDERS );

			// Ignore strings without any placeholders
			if ( ! singularMatch && ! pluralMatch ) {
				return;
			}

			if ( ( singularMatch && ! pluralMatch ) ||
					( ! singularMatch && pluralMatch ) ||
					( singularMatch.length !== pluralMatch.length ) ) {
				context.report( node, rule.ERROR_MESSAGE );
			}
		}
	};
};

rule.ERROR_MESSAGE = 'Should have same number of placeholders between singular and plural';

rule.schema = [];
