/**
 * External Dependencies
 */
import { assert } from 'chai';
import sinon from 'sinon';

/**
 * Internal Dependencies
 */
import useMockery from 'test/helpers/use-mockery';
import useFakeDom from 'test/helpers/use-fake-dom';

describe( 'StatList', () => {
	const statListOptions = { siteID: 1, statType: 'statsClicks', date: '2014-07-04', period: 'day' };
	const errorStatListOptions = { siteID: 1, statType: 'statsEvents' };
	let StatList, statsParser, data;

	useMockery( mockery => {
		mockery.registerMock( 'lib/wp', require( './mocks/lib/wp' ) );
		mockery.registerMock( 'lib/user', require( './mocks/lib/user' ) );
	} );

	useFakeDom();

	before( () => {
		StatList = require( '..' );
		statsParser = require( '../stats-parser' )();
		data = require( './fixtures/data' );
	} );

	describe( 'required options', () => {
		const statListFactory = options => new StatList( options );

		it( 'should require a siteID', () => {
			assert.throw( () => {
				statListFactory( { statType: 'statsClicks' } );
			}, TypeError );
		} );

		it( 'should require a statType', () => {
			assert.throw( () => {
				statListFactory( { siteID: 1 } );
			}, TypeError );
		} );

		it( 'should only allow valid statTypes', () => {
			assert.throw( () => {
				statListFactory( { statType: 'statsWookieList', siteID: 1 } );
			}, TypeError );
		} );
	} );

	describe( 'attributes', function() {
		let statList, errorStatList;
		beforeEach( () => {
			statList = new StatList( Object.assign( {}, statListOptions ) );
			errorStatList = new StatList( Object.assign( {}, errorStatListOptions ) );
		} );

		it( 'should create a response object', () => {
			assert.typeOf( statList.response, 'object', 'respose object created' );
			assert.typeOf( statList.response.data, 'array', 'respose data array created' );
		} );

		it( 'should create an options object', () => {
			assert.typeOf( statList.options, 'object', 'options object created' );
		} );

		it( 'should not have siteID in options object', () => {
			assert.isUndefined( statList.options.siteID );
		} );

		it( 'should not have statType in options object', () => {
			assert.isUndefined( statList.options.statType );
		} );

		it( 'should set siteID', () => {
			assert.equal( statList.siteID, 1, 'should set the siteID' );
		} );

		it( 'should set statType', () => {
			assert.equal( statList.statType, 'statsClicks', 'should set the statType' );
		} );

		it( 'should set localStoreKey', () => {
			assert.equal( statList.localStoreKey, statList.statType + statList.siteID, 'should set the localStoreKey' );
		} );

		it( 'should default performRetry to true', () => {
			assert.isTrue( statList.performRetry, 'should performRetry' );
		} );

		it( 'should set isDocumentedEndpoint correct', () => {
			assert.isTrue( statList.isDocumentedEndpoint, 'documented endpoints should be true' );
			assert.isFalse( errorStatList.isDocumentedEndpoint, 'undocumented endpoints should be false' );
		} );
	} );

	describe( 'fetch', function() {
		let statList, errorStatList;

		before( () => {
			statList = new StatList( Object.assign( {}, statListOptions ) );
			errorStatList = new StatList( Object.assign( {}, errorStatListOptions ) );
		} );

		it( 'should have a fetch function', () => {
			assert.typeOf( statList.fetch, 'function', 'it should have a fetch function' );
		} );

		it( 'should set loading to false', () => {
			statList.fetch();
			assert.isFalse( statList.isLoading() );
		} );

		it( 'should not perform retry on success', () => {
			statList.fetch();
			assert.isTrue( statList.performRetry );
		} );

		// since our test payload is jibberish, empty should be true
		// see test-stats-parsers for payload parsing coverage
		it( 'should be empty', () => {
			statList.fetch();
			assert.isTrue( statList.isEmpty() );
		} );

		it( 'should emit change', () => {
			const changeCallback = sinon.spy();
			statList.on( 'change', changeCallback );
			statList.fetch();
			assert.isTrue( changeCallback.called, 'callbacks subscribed to change should be called' );
		} );

		it( 'should not error on success', () => {
			statList.fetch();
			assert.isFalse( statList.isError() );
		} );

		it( 'should error on failure', () => {
			errorStatList.fetch();
			assert.isTrue( errorStatList.isError() );
		} );

		it( 'should retry on failure', () => {
			errorStatList.fetch();
			assert.isFalse( errorStatList.performRetry );
		} );

		it( 'should emit change on failure', () => {
			const changeCallback = sinon.spy();
			errorStatList.on( 'change', changeCallback );
			errorStatList.fetch();
			assert.isTrue( changeCallback.called, 'callbacks subscribed to change should be called' );
		} );
	} );

	describe( 'object data sets', () => {
		let statList;

		before( () => {
			statList = new StatList( Object.assign( {}, statListOptions ) );
		} );

		it( 'should set loading false', () => {
			const mockContext = { options: { period: 'day', date: '2014-09-12' } }; // we have to pass in some context to calculate start of period on this call

			const response = statsParser.statsComments.call( mockContext, data.successResponses.statsComments.body );

			assert.typeOf( response.data.authors, 'array', 'it should have an authors array' );
			statList.fetch();
			assert.isFalse( statList.isLoading(), 'it should not be loading' );
			// set the data to the object response
			statList.response = response;
			assert.isFalse( statList.isEmpty( 'posts' ), 'posts should not be empty' );
		} );
	} );
} );
