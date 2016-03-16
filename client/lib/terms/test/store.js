/**
 * External dependencies
 */
var assert = require( 'chai' ).assert,
	mockery = require( 'mockery' );

/**
 * Internal dependencies
 */
var data = require( './data' ),
	useMockery = require( 'test/helpers/use-mockery' );

var TEST_SITE_ID = 777,
	TEST_CATEGORY_ID = 1,
	TEMPORARY_ID = 'category-0';

describe( 'store', function() {
	let TermStore, Dispatcher;

	useMockery();

	beforeEach( function() {
		mockery.resetCache();
		TermStore = require( '../store' );
		Dispatcher = require( 'dispatcher' );
	} );

	function dispatchReceiveTerms() {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_TERMS',
			siteId: TEST_SITE_ID,
			data: {
				terms: data.treeList,
				found: data.treeList.length
			},
			error: null
		} );
	}

	describe( 'dispatchToken', function() {
		it( 'should have a dispatch token', function() {
			assert.typeOf( TermStore.dispatchToken, 'string' );
		} );

		it( 'should emit change event', function( done ) {
			// Future tests may also trigger this event
			TermStore.once( 'change', done );
			dispatchReceiveTerms();
		} );
	} );

	it( 'Should remove a term if a temporary ID is present', function() {
		var categories;

		Dispatcher.handleServerAction( {
			type: 'RECEIVE_ADD_TERM',
			siteId: TEST_SITE_ID,
			data: {
				terms: [
					{
						id: TEMPORARY_ID,
						name: 'OMG temporary'
					}
				]
			},
			error: null
		} );
		assert.equal( TermStore.all( TEST_SITE_ID ).length, 1 );

		Dispatcher.handleServerAction( {
			type: 'RECEIVE_ADD_TERM',
			siteId: TEST_SITE_ID,
			id: TEMPORARY_ID,
			data: {
				terms: [
					{
						id: 1111,
						name: 'OMG temporary'
					}
				]
			},
			error: null
		} );
		categories = TermStore.all( TEST_SITE_ID );

		assert.equal( categories.length, 1 );
		assert.equal( categories[ 0 ].id, 1111 );
	} );

	it( '#all()', function() {
		dispatchReceiveTerms();
		const categoryData = TermStore.all( TEST_SITE_ID );

		assert.equal( categoryData[0].name, 'a cat' );
		assert.equal( categoryData.length, data.treeList.length );
	} );

	it( '#get()', function() {
		dispatchReceiveTerms();

		const category = TermStore.get( TEST_SITE_ID, TEST_CATEGORY_ID );
		assert.equal( category.name, 'a cat' );
	} );

	it( '#get() undefined', function() {
		dispatchReceiveTerms();

		assert.isUndefined( TermStore.get( TEST_SITE_ID, 7878 ) );
	} );
} );
