/**
 * Module dependencies
 */
var assert = require( 'assert' );

/**
 * Fixture
 */
var fixture = require( './fixture' );

/**
 * Sync tests
 */

describe( 'fixture', function () {
	describe( 'general', function () {
		it( '`post` should be ok', function () {
			assert.ok( fixture.post );
			assert.equal( 'object', typeof fixture.post );

			assert.equal( 'string', typeof fixture.post.title );
			assert.equal( 'string', typeof fixture.post.content );
		} );
	} );
} );
