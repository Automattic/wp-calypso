/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	withAnalytics,
	bumpStat,
	recordCustomAdWordsRemarketingEvent,
	recordCustomFacebookConversionEvent,
	recordGoogleEvent,
	recordGooglePageView,
	recordTracksEvent,
	recordPageView,
	setTracksAnonymousUserId,
	optOutTracks,
} from '../actions';
import { dispatcher as dispatch } from '../middleware.js';
import { spy as mockAnalytics } from 'lib/analytics';
import { spy as mockAdTracking } from 'lib/analytics/ad-tracking';

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

describe( 'middleware', () => {
	describe( 'analytics dispatching', () => {
		beforeEach( () => {
			mockAnalytics.reset();
			mockAdTracking.reset();
		} );

		test( 'should call mc.bumpStat', () => {
			dispatch( bumpStat( 'test', 'value' ) );

			expect( mockAnalytics ).to.have.been.calledWith( 'mc.bumpStat' );
		} );

		test( 'should call tracks.recordEvent', () => {
			dispatch( recordTracksEvent( 'test', { name: 'value' } ) );

			expect( mockAnalytics ).to.have.been.calledWith( 'tracks.recordEvent' );
		} );

		test( 'should call pageView.record', () => {
			dispatch( recordPageView( 'path', 'title' ) );

			expect( mockAnalytics ).to.have.been.calledWith( 'pageView.record' );
		} );

		test( 'should call ga.recordEvent', () => {
			dispatch( recordGoogleEvent( 'category', 'action' ) );

			expect( mockAnalytics ).to.have.been.calledWith( 'ga.recordEvent' );
		} );

		test( 'should call ga.recordPageView', () => {
			dispatch( recordGooglePageView( 'path', 'title' ) );

			expect( mockAnalytics ).to.have.been.calledWith( 'ga.recordPageView' );
		} );

		test( 'should call trackCustomFacebookConversionEvent', () => {
			dispatch( recordCustomFacebookConversionEvent( 'event', { name: 'value' } ) );

			expect( mockAdTracking ).to.have.been.calledWith( 'trackCustomFacebookConversionEvent' );
		} );

		test( 'should call trackCustomAdWordsRemarketingEvent', () => {
			dispatch( recordCustomAdWordsRemarketingEvent( { name: 'value' } ) );

			expect( mockAdTracking ).to.have.been.calledWith( 'trackCustomAdWordsRemarketingEvent' );
		} );

		test( 'should call analytics events with wrapped actions', () => {
			dispatch( withAnalytics( bumpStat( 'name', 'value' ), { type: 'TEST_ACTION' } ) );

			expect( mockAnalytics ).to.have.been.calledWith( 'mc.bumpStat' );
		} );

		test( 'should call setTracksAnonymousUserId', () => {
			dispatch( setTracksAnonymousUserId( 'abcd1234' ) );

			expect( mockAnalytics ).to.have.been.calledWith( 'tracks.setAnonymousUserId' );
		} );

		test( 'should call `optOut`', () => {
			dispatch( optOutTracks( false ) );

			expect( mockAnalytics ).to.have.been.calledWith( 'tracks.optOut' );
		} );
	} );
} );
