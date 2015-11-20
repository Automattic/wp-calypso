require( 'lib/react-test-env-setup' )();

// External Dependencies
var assert = require('chai').assert,
	sinon = require('sinon');

var StatList = require( '..' ),
	options = { siteID: 1, statType: 'statsClicks', date: '2014-07-04', period: 'day' },
	statsParser = require( '../stats-parser' )(),
	data = require( './data' ),
	statList = new StatList( options ),
	errorOptions = { siteID: 1, statType: 'statsEvents' },
	errorStatList = new StatList( errorOptions );

// helper functions
describe( 'StatList', function() {
	describe( 'required options', function() {
		
		it( 'should require a siteID', function() {
			assert.throw( function() { new StatList( { statType: 'statsClicks' } ); }, TypeError );
		} );

		it( 'should require a statType', function() {
			assert.throw( function() { new StatList( { siteID: 1 } ); }, TypeError );
		} );

		it( 'should only allow valid statTypes', function() {
			assert.throw( function() { new StatList( { statType: 'statsWookieList', siteID: 1 } ); }, TypeError );
		} );

	} );

	describe( 'attributes', function() {

		it( 'should create a response object', function(){
			assert.typeOf( statList.response, 'object', 'respose object created' );
			assert.typeOf( statList.response.data, 'array', 'respose data array created' );

		} );

		it( 'should create an options object', function(){
			assert.typeOf( statList.options, 'object', 'options object created' );
		} );

		it( 'should not have siteID in options object', function() {
			assert.isUndefined( statList.options.siteID );
		} );

		it( 'should not have statType in options object', function() {
			assert.isUndefined( statList.options.statType );
		} );

		it( 'should set siteID', function(){
			assert.equal( statList.siteID, 1, 'should set the siteID' );
		} );

		it( 'should set statType', function(){
			assert.equal( statList.statType, 'statsClicks', 'should set the statType' );
		} );

		it( 'should set localStoreKey', function(){
			assert.equal( statList.localStoreKey, statList.statType + statList.siteID, 'should set the localStoreKey' );
		} );

		it( 'should default performRetry to true', function(){
			assert.isTrue( statList.performRetry, 'should performRetry' );
		} );

		it( 'should set isDocumentedEndpoint correct', function() {
			assert.isTrue( statList.isDocumentedEndpoint, 'documented endpoints should be true' );
			assert.isFalse( errorStatList.isDocumentedEndpoint, 'undocumented endpoints should be false' );
		} );

	} );

	describe( 'fetch', function() {

		it( 'should have a fetch function', function() {
			assert.typeOf( statList.fetch, 'function', 'it should have a fetch function' );
		} );

		it( 'should set loading to false', function() {
			statList.fetch();
			assert.isFalse( statList.isLoading() );
		} );

		it( 'should not perform retry on success', function() {
			statList.fetch();
			assert.isTrue( statList.performRetry );
		} );

		// since our test payload is jibberish, empty should be true
		// see test-stats-parsers for payload parsing coverage
		it( 'should be empty', function() {
			statList.fetch();
			assert.isTrue( statList.isEmpty() );
		} );

		it( 'should emit change', function() {
			var changeCallback = sinon.spy();
			statList.on( 'change', changeCallback );
			statList.fetch();
			assert.isTrue( changeCallback.called, 'callbacks subscribed to change should be called' );
		} );

		it( 'should not error on success', function() {
			statList.fetch();
			assert.isFalse( statList.isError() );
		} );

		it( 'should error on failure', function() {
			errorStatList.fetch();
			assert.isTrue( errorStatList.isError() );
		} );

		it( 'should retry on failure', function() {
			errorStatList.fetch();
			assert.isFalse( errorStatList.performRetry );
		} );

		it( 'should emit change on failure', function() {
			var changeCallback = sinon.spy();
			errorStatList.on( 'change', changeCallback );
			errorStatList.fetch();
			assert.isTrue( changeCallback.called, 'callbacks subscribed to change should be called' );
		} );
	} );

	describe( 'object data sets', function() {
		it( 'should set loading false', function(){
			var mockContext = { options: { period: 'day', date: '2014-09-12' } }, // we have to pass in some context to calculate start of period on this call
				response = statsParser.statsComments.call( mockContext, data.successResponses.statsComments.body );

			assert.typeOf( response.data.authors, 'array', 'it should have an authors array' );
			statList.fetch();
			assert.isFalse( statList.isLoading(), 'it should not be loading' );
			// set the data to the object response
			statList.response = response;
			assert.isFalse( statList.isEmpty( 'posts' ), 'posts should not be empty' );
		} );
	} );
} );
