/**
 * @file Utility for extracting strings from node
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

const formatMessage = require( '../format-message.js' );

describe( 'test utils', function () {
	describe( 'formatMessage', function () {
		test( 'should not change the string without a matching placeholder', function () {
			expect( formatMessage( 'An unchanged {{message}}', {} ) ).toBe( 'An unchanged {{message}}' );
		} );

		test( 'should replace the placeholder with the property with the same name', function () {
			expect(
				formatMessage( 'A{{adjective}} {{noun}}', { adjective: ' substituted', noun: 'string' } )
			).toBe( 'A substituted string' );
		} );
	} );
} );
