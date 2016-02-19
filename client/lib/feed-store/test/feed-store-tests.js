/**
 * External Dependencies
 */
var expect = require( 'chai' ).expect,
	mockery = require( 'mockery' ),
	sinon = require( 'sinon' ),
	forOwn = require( 'lodash/forOwn' );

var FeedState = require( '../constants' ).state,
	FeedStore, FeedStoreActions;

describe( 'FeedStore', function() {
	var readFeedStub,
		mockWpcom = {
			undocumented: function() {
				return { readFeed: readFeedStub };
			}
		},
		changeSpy = sinon.spy();

	before( function() {
		mockery.enable( {
			useCleanCache: true,
			warnOnUnregistered: false
		} );
		mockery.registerAllowable( [ '../', '../actions' ] );
		mockery.registerMock( 'lib/wp', mockWpcom );

		FeedStore = require( '../' );
		FeedStoreActions = require( '../actions' );
		FeedStore.on( 'change', changeSpy );
	} );

	after( function() {
		FeedStore.off( 'change', changeSpy );
		mockery.disable();
	} );

	beforeEach( function() {
		readFeedStub = sinon.stub();
		changeSpy.reset();
	} );

	it( 'should have a dispatch token', function() {
		expect( FeedStore ).to.have.property( 'dispatchToken' );
	} );

	it( 'should not contain an unknown feed ID', function() {
		expect( FeedStore.get( 'UNKNOWN' ) ).to.be.undefined;
	} );

	it( 'should prevent double fetches', function() {
		FeedStoreActions.fetch( 'twice' );
		FeedStoreActions.fetch( 'twice' );

		expect( readFeedStub.callCount ).to.equal( 1 );
		expect( changeSpy.callCount ).to.equal( 0 );
	} );

	it( 'should accept a good response', function() {
		var feed = {
				feed_ID: 1234,
				blog_ID: 95327318,
				name: 'test',
				URL: 'http://example.com',
				feed_URL: 'http://example.com/feed/',
				subscribers_count: 100
			}, feedFromStore;

		readFeedStub.callsArgWith( 1, null, feed );

		FeedStoreActions.fetch( 1234 );

		expect( changeSpy.callCount ).to.equal( 1 );

		feedFromStore = FeedStore.get( 1234 );

		expect( feedFromStore ).to.be.ok;
		expect( feedFromStore.state ).to.equal( FeedState.COMPLETE );

		forOwn( feed, function( val, key ) {
			expect( feedFromStore[ key ] ).to.eql( val );
		} );
	} );

	it( 'should accept an error', function() {
		var error = 'boom', feedFromStore;

		readFeedStub.callsArgWith( 1, error, null );

		FeedStoreActions.fetch( 'BAD' );

		expect( changeSpy.callCount ).to.equal( 1 );

		feedFromStore = FeedStore.get( 'BAD' );

		expect( feedFromStore ).to.be.ok;
		expect( feedFromStore.state ).to.equal( FeedState.ERROR );
		expect( feedFromStore.error ).to.equal( error );
	} );
} );
