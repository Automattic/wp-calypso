/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';
import superagent from 'superagent';

/**
 * Internal dependencies
 */
import { statsdTimingUrl, statsdCountingUrl } from 'lib/analytics/statsd-utils';
import analytics from '../index';
import config from 'config';
jest.mock( 'config', () => require( 'sinon' ).stub() );
jest.mock( 'lib/analytics/statsd-utils', () => ( {
	statsdTimingUrl: require( 'sinon' ).stub(),
	statsdCountingUrl: require( 'sinon' ).stub(),
} ) );

describe( 'Server-Side Analytics', () => {
	describe( 'tracks.recordEvent', () => {} );

	describe( 'statsd.recordTiming', () => {
		beforeAll( function() {
			sinon.stub( superagent, 'get' ).returns( { end: () => {} } );
		} );

		afterEach( () => {
			config.reset();
			statsdTimingUrl.reset();
			superagent.get.reset();
		} );

		afterAll( () => {
			sinon.restore();
		} );

		test( 'sends an HTTP request to the statsd URL', () => {
			config.withArgs( 'server_side_boom_analytics_enabled' ).returns( true );
			statsdTimingUrl.returns( 'http://example.com/boom.gif' );

			analytics.statsd.recordTiming( 'reader', 'page-render', 150 );

			expect( statsdTimingUrl ).to.have.been.calledWith( 'reader', 'page-render', 150 );
			expect( superagent.get ).to.have.been.calledWith( 'http://example.com/boom.gif' );
		} );

		test( 'does nothing if statsd analytics is not allowed', () => {
			config.withArgs( 'server_side_boom_analytics_enabled' ).returns( false );

			analytics.statsd.recordTiming( 'reader', 'page-render', 150 );

			expect( statsdTimingUrl ).not.to.have.been.called;
			expect( superagent.get ).not.to.have.been.called;
		} );
	} );

	describe( 'statsd.recordCounting', () => {
		beforeAll( function() {
			sinon.stub( superagent, 'get' ).returns( { end: () => {} } );
		} );

		afterEach( () => {
			config.reset();
			statsdCountingUrl.reset();
			superagent.get.reset();
		} );

		afterAll( () => {
			sinon.restore();
		} );

		test( 'sends an HTTP request to the statsd URL', () => {
			config.withArgs( 'server_side_boom_analytics_enabled' ).returns( true );
			statsdCountingUrl.returns( 'http://example.com/boom.gif' );

			analytics.statsd.recordCounting( 'reader', 'page-count', 1 );

			expect( statsdCountingUrl ).to.have.been.calledWith( 'reader', 'page-count', 1 );
			expect( superagent.get ).to.have.been.calledWith( 'http://example.com/boom.gif' );
		} );

		test( 'does nothing if statsd analytics is not allowed', () => {
			config.withArgs( 'server_side_boom_analytics_enabled' ).returns( false );

			analytics.statsd.recordCounting( 'reader', 'page-count', 1 );

			expect( statsdCountingUrl ).not.to.have.been.called;
			expect( superagent.get ).not.to.have.been.called;
		} );
	} );
} );
