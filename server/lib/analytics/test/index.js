/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';
import useMockery from 'test/helpers/use-mockery';

describe( 'Server-Side Analytics', function() {
	describe( 'tracks.recordEvent', function() {

	} );

	describe( 'statsd.recordTiming', function() {
		// Allow us to mock disabling statsd.
		const mockConfig = {
			server_side_boom_analytics_enabled: true
		};

		useMockery( mockery => {
			mockery.registerMock( 'config', ( key ) => {
				return mockConfig[ key ];
			} );
		} );

		let superagent, analytics, statsd;

		beforeEach( function() {
			superagent = require( 'superagent' );
			analytics = require( '../index' );
			statsd = require( '../../../../client/lib/analytics/statsd' );

			sinon.stub( superagent, 'get' ).returns( { end: () => {} } );
		} );

		afterEach( function() {
			superagent.get.restore();
		} );

		it( 'sends an HTTP request to the statsd URL', function() {
			sinon.stub( statsd, 'statsdTimingUrl' ).returns( 'http://example.com/boom.gif' );

			analytics.statsd.recordTiming( 'reader', 'page-render', 150 );

			expect( statsd.statsdTimingUrl ).to.have.been.calledWith( 'reader', 'page-render', 150 );
			expect( superagent.get ).to.have.been.calledWith( 'http://example.com/boom.gif' );

			statsd.statsdTimingUrl.restore();
		} );

		it( 'does nothing if statsd analytics is not allowed', function() {
			mockConfig.server_side_boom_analytics_enabled = false;
			sinon.stub( statsd, 'statsdTimingUrl' );

			analytics.statsd.recordTiming( 'reader', 'page-render', 150 );

			expect( statsd.statsdTimingUrl ).not.to.have.been.called;
			expect( superagent.get ).not.to.have.been.called;

			statsd.statsdTimingUrl.restore();
		} );
	} );
} );
