jest.mock( 'lib/analytics', () => {
	const analyticsSpy = require( 'sinon' ).spy();
	const { analyticsMock } = require( './helpers/analytics-mock' );

	const mock = analyticsMock( analyticsSpy );
	mock.spy = analyticsSpy;

	return mock;
} );
jest.mock( 'lib/analytics/ad-tracking', () => {
	const adTrackingSpy = require( 'sinon' ).spy();
	const { adTrackingMock } = require( './helpers/analytics-mock' );

	const mock = adTrackingMock( adTrackingSpy );
	mock.spy = adTrackingSpy;

	return mock;
} );

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { dispatcher as dispatch } from '../middleware.js';
import {
	withAnalytics,
	bumpStat,
	recordCustomAdWordsRemarketingEvent,
	recordCustomFacebookConversionEvent,
	recordGoogleEvent,
	recordGooglePageView,
	recordTracksEvent,
	recordPageView,
	setTracksAnonymousUserId
} from '../actions';
import { spy as mockAnalytics } from 'lib/analytics';
import { spy as mockAdTracking } from 'lib/analytics/ad-tracking';

describe( 'middleware', () => {
	describe( 'analytics dispatching', () => {
		beforeEach( () => {
			mockAnalytics.reset();
			mockAdTracking.reset();
		} );

		it( 'should call mc.bumpStat', () => {
			dispatch( bumpStat( 'test', 'value' ) );

			expect( mockAnalytics ).to.have.been.calledWith( 'mc.bumpStat' );
		} );

		it( 'should call tracks.recordEvent', () => {
			dispatch( recordTracksEvent( 'test', { name: 'value' } ) );

			expect( mockAnalytics ).to.have.been.calledWith( 'tracks.recordEvent' );
		} );

		it( 'should call pageView.record', () => {
			dispatch( recordPageView( 'path', 'title' ) );

			expect( mockAnalytics ).to.have.been.calledWith( 'pageView.record' );
		} );

		it( 'should call ga.recordEvent', () => {
			dispatch( recordGoogleEvent( 'category', 'action' ) );

			expect( mockAnalytics ).to.have.been.calledWith( 'ga.recordEvent' );
		} );

		it( 'should call ga.recordPageView', () => {
			dispatch( recordGooglePageView( 'path', 'title' ) );

			expect( mockAnalytics ).to.have.been.calledWith( 'ga.recordPageView' );
		} );

		it( 'should call tracks.recordEvent', () => {
			dispatch( recordTracksEvent( 'event', { name: 'value' } ) );

			expect( mockAnalytics ).to.have.been.calledWith( 'tracks.recordEvent' );
		} );

		it( 'should call trackCustomFacebookConversionEvent', () => {
			dispatch( recordCustomFacebookConversionEvent( 'event', { name: 'value' } ) );

			expect( mockAdTracking ).to.have.been.calledWith( 'trackCustomFacebookConversionEvent' );
		} );

		it( 'should call trackCustomAdWordsRemarketingEvent', () => {
			dispatch( recordCustomAdWordsRemarketingEvent( { name: 'value' } ) );

			expect( mockAdTracking ).to.have.been.calledWith( 'trackCustomAdWordsRemarketingEvent' );
		} );

		it( 'should call analytics events with wrapped actions', () => {
			dispatch( withAnalytics( bumpStat( 'name', 'value' ), { type: 'TEST_ACTION' } ) );

			expect( mockAnalytics ).to.have.been.calledWith( 'mc.bumpStat' );
		} );

		it( 'should call setTracksAnonymousUserId', () => {
			dispatch( setTracksAnonymousUserId( 'abcd1234' ) );

			expect( mockAnalytics ).to.have.been.calledWith( 'tracks.setAnonymousUserId' );
		} );
	} );
} );
