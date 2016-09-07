/**
 * @fileoverview Utility for extracting strings from node
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

var assert = require( 'assert' );
var formatMessage = require( './format-message.js' );

describe( 'test utils', function() {
	describe( 'formatMessage', function() {
		it( 'should not change the string without a matching placeholder', function() {
			assert.equal( 'An unchanged {{message}}', formatMessage( 'An unchanged {{message}}', {} ) );
		} );

		it( 'should replace the placeholder with the property with the same name', function() {
			assert.equal( 'A substituted string', formatMessage( 'A{{adjective}} {{noun}}',
				{ adjective: ' substituted', noun: 'string' } ) );
		} );
	} );
} );
