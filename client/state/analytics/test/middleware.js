/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';
import {
	withAnalytics,
	bumpStat,
	recordCustomAdWordsRemarketingEvent,
	recordCustomFacebookConversionEvent,
	recordGoogleEvent,
	recordGooglePageView,
	recordTracksEvent,
	recordPageView
} from '../actions';
import {
	adTrackingMock,
	analyticsMock,
} from './helpers/analytics-mock';

describe( 'middleware', () => {
	describe( 'analytics dispatching', () => {
		const mockAnalytics = spy();
		const mockAdTracking = spy();
		let dispatch;

		useMockery( mockery => {
			mockery.registerMock( 'lib/analytics', analyticsMock( mockAnalytics ) );
			mockery.registerMock( 'lib/analytics/ad-tracking', adTrackingMock( mockAdTracking ) );

			dispatch = require( '../middleware.js' ).dispatcher;
		} );

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
	} );
} );
