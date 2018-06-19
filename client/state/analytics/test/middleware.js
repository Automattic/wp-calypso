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
	setTracksOptOut,
	loadTrackingTool,
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

			expect( mockAnalytics ).to.have.been.calledWithExactly( 'mc.bumpStat', 'test', 'value' );
		} );

		test( 'should call tracks.recordEvent', () => {
			dispatch( recordTracksEvent( 'test', { name: 'value' } ) );

			expect( mockAnalytics ).to.have.been.calledWithExactly( 'tracks.recordEvent', 'test', {
				name: 'value',
			} );
		} );

		test( 'should call pageView.record', () => {
			dispatch( recordPageView( 'path', 'title', 'default', { name: 'value' } ) );

			expect( mockAnalytics ).to.have.been.calledWithExactly( 'pageView.record', 'path', 'title', {
				name: 'value',
			} );
		} );

		test( 'should call ga.recordEvent', () => {
			dispatch( recordGoogleEvent( 'category', 'action', 'label', 'value' ) );

			expect( mockAnalytics ).to.have.been.calledWithExactly(
				'ga.recordEvent',
				'category',
				'action',
				'label',
				'value'
			);
		} );

		test( 'should call ga.recordPageView', () => {
			dispatch( recordGooglePageView( 'path', 'title' ) );

			expect( mockAnalytics ).to.have.been.calledWithExactly(
				'ga.recordPageView',
				'path',
				'title'
			);
		} );

		test( 'should call trackCustomFacebookConversionEvent', () => {
			dispatch( recordCustomFacebookConversionEvent( 'event', { name: 'value' } ) );

			expect( mockAdTracking ).to.have.been.calledWithExactly(
				'trackCustomFacebookConversionEvent',
				'event',
				{ name: 'value' }
			);
		} );

		test( 'should call trackCustomAdWordsRemarketingEvent', () => {
			dispatch( recordCustomAdWordsRemarketingEvent( { name: 'value' } ) );

			expect( mockAdTracking ).to.have.been.calledWithExactly(
				'trackCustomAdWordsRemarketingEvent',
				{ name: 'value' }
			);
		} );

		test( 'should call analytics events with wrapped actions', () => {
			dispatch( withAnalytics( bumpStat( 'name', 'value' ), { type: 'TEST_ACTION' } ) );

			expect( mockAnalytics ).to.have.been.calledWithExactly( 'mc.bumpStat', 'name', 'value' );
		} );

		test( 'should call `setOptOut`', () => {
			dispatch( setTracksOptOut( false ) );

			expect( mockAnalytics ).to.have.been.calledWithExactly( 'tracks.setOptOut', false );
		} );

		test( 'should call hotjar.addHotJarScript', () => {
			dispatch( loadTrackingTool( 'HotJar' ), { analyticsTracking: [] } );

			expect( mockAnalytics ).to.have.been.calledWith( 'hotjar.addHotJarScript' );
		} );
	} );
} );
