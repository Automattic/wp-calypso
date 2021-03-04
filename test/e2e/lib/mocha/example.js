const assert = require( 'assert' );

describe( 'Sute 1', function () {
	it( 'Test 1', function () {
		assert.equal( true, false );
	} );
	it( 'Test 2', function () {
		assert.equal( true, true );
	} );
	it.skip( 'Test 3', function () {
		assert.equal( true, true );
	} );

	describe( 'Nested Sute 1', function () {
		it( 'Test 1', function () {
			assert.equal( true, false );
		} );
		it( 'Test 2', function () {
			assert.equal( true, true );
		} );
		it.skip( 'Test 3', function () {
			assert.equal( true, true );
		} );
	} );

	describe.skip( 'Skipped Sute 1', function () {
		it( 'Test 1', function () {
			assert.equal( true, false );
		} );
		it( 'Test 2', function () {
			assert.equal( true, true );
		} );
		it.skip( 'Test 3', function () {
			assert.equal( true, true );
		} );
	} );

	describe( 'Hooked Sute 1', function () {
		before( 'Hook name', () => {} );
		it( 'Test 1', function () {
			assert.equal( true, false );
		} );
	} );

	describe( 'Broken Sute 1', function () {
		before( 'Hook name', () => {
			throw new Error( 'broken!' );
		} );
		it( 'Test 1', function () {
			assert.equal( true, false );
		} );
	} );
} );
