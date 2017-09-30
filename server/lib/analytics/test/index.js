jest.mock( 'config', () => require( 'sinon' ).stub() );
jest.mock( '../../../../client/lib/analytics/statsd', () => ( {
	statsdTimingUrl: require( 'sinon' ).stub()
} ) );

/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';
import superagent from 'superagent';

/**
 * Internal dependencies
 */
import analytics from '../index';
import config from 'config';
import { statsdTimingUrl } from '../../../../client/lib/analytics/statsd';

describe( 'Server-Side Analytics', function() {
	describe( 'tracks.recordEvent', function() {

	} );

	describe( 'statsd.recordTiming', function() {
		beforeAll( function() {
			sinon.stub( superagent, 'get' ).returns( { end: () => {} } );
		} );

		afterEach( function() {
			config.reset();
			statsdTimingUrl.reset();
			superagent.get.reset();
		} );

		it( 'sends an HTTP request to the statsd URL', function() {
			config.withArgs( 'server_side_boom_analytics_enabled' ).returns( true );
			statsdTimingUrl.returns( 'http://example.com/boom.gif' );

			analytics.statsd.recordTiming( 'reader', 'page-render', 150 );

			expect( statsdTimingUrl ).to.have.been.calledWith( 'reader', 'page-render', 150 );
			expect( superagent.get ).to.have.been.calledWith( 'http://example.com/boom.gif' );
		} );

		it( 'does nothing if statsd analytics is not allowed', function() {
			config.withArgs( 'server_side_boom_analytics_enabled' ).returns( false );

			analytics.statsd.recordTiming( 'reader', 'page-render', 150 );

			expect( statsdTimingUrl ).not.to.have.been.called;
			expect( superagent.get ).not.to.have.been.called;
		} );
	} );
} );
