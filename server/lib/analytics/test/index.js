/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import analytics from '../index';

const statsd = require( '../../../../client/lib/analytics/statsd' );

describe( 'Server-Side Analytics', function() {
	describe( 'statsd.recordTiming', function() {
		let http;

		beforeEach( function() {
			http = require( 'http' );
			sinon.stub( http, 'get' );
		} );

		afterEach( function() {
			http.get.restore();
		} );

		it( 'sends an HTTP request to the statsd URL', function() {
			sinon.stub( statsd, 'isStatsdAnalyticsAllowed' ).returns( true );
			sinon.stub( statsd, 'statsdUrl' ).returns( 'http://example.com/boom.gif' );

			analytics.statsd.recordTiming( 'reader', 'page-render', 150 );

			expect( statsd.statsdUrl ).to.have.been.calledWith( 'reader', 'page-render', 150 );
			expect( http.get ).to.have.been.calledWith( 'http://example.com/boom.gif' );

			statsd.isStatsdAnalyticsAllowed.restore();
			statsd.statsdUrl.restore();
		} );

		it( 'does nothing if statsd analytics is not allowed', function() {
			sinon.stub( statsd, 'isStatsdAnalyticsAllowed' ).returns( false );
			sinon.stub( statsd, 'statsdUrl' );

			analytics.statsd.recordTiming( 'reader', 'page-render', 150 );

			expect( statsd.statsdUrl ).not.to.have.been.called;
			expect( http.get ).not.to.have.been.called;

			statsd.isStatsdAnalyticsAllowed.restore();
			statsd.statsdUrl.restore();
		} );
	} );
} );
