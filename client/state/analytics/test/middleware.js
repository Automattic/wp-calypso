/**
 * External dependencies
 */
import { expect } from 'chai';
import { noop } from 'lodash';

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
import { analyticsMiddleware } from '../middleware.js';
import { spy as mockAdTracking } from 'lib/analytics/ad-tracking';
import { spy as mockMC } from 'lib/analytics/mc';
import { spy as mockGA } from 'lib/analytics/ga';
import { spy as mockPageView } from 'lib/analytics/page-view';
import { spy as mockTracks } from 'lib/analytics/tracks';
import { addHotJarScript } from 'lib/analytics/hotjar';

jest.mock( 'lib/analytics/page-view', () => {
	const pageViewSpy = require( 'sinon' ).spy();
	const { pageViewMock } = require( './helpers/analytics-mock' );

	const mock = pageViewMock( pageViewSpy );
	mock.spy = pageViewSpy;

	return mock;
} );

jest.mock( 'lib/analytics/tracks', () => {
	const tracksSpy = require( 'sinon' ).spy();
	const { tracksMock } = require( './helpers/analytics-mock' );

	const mock = tracksMock( tracksSpy );
	mock.spy = tracksSpy;

	return mock;
} );

jest.mock( 'lib/analytics/ad-tracking', () => {
	const adTrackingSpy = require( 'sinon' ).spy();
	const { adTrackingMock } = require( './helpers/analytics-mock' );

	const mock = adTrackingMock( adTrackingSpy );
	mock.spy = adTrackingSpy;

	return mock;
} );

jest.mock( 'lib/analytics/mc', () => {
	const mcSpy = require( 'sinon' ).spy();
	const { mcMock } = require( './helpers/analytics-mock' );

	const mock = mcMock( mcSpy );
	mock.spy = mcSpy;

	return mock;
} );

jest.mock( 'lib/analytics/ga', () => {
	const gaSpy = require( 'sinon' ).spy();
	const { gaMock } = require( './helpers/analytics-mock' );

	const mock = gaMock( gaSpy );
	mock.spy = gaSpy;

	return mock;
} );

jest.mock( 'lib/analytics/hotjar', () => ( {
	addHotJarScript: require( 'sinon' ).spy(),
} ) );

const dispatch = analyticsMiddleware()( noop );

describe( 'middleware', () => {
	describe( 'analytics dispatching', () => {
		beforeEach( () => {
			mockPageView.resetHistory();
			mockTracks.resetHistory();
			mockAdTracking.resetHistory();
		} );

		test( 'should call mc.bumpStat', () => {
			dispatch( bumpStat( 'test', 'value' ) );

			expect( mockMC ).to.have.been.calledWithExactly( 'bumpStat', 'test', 'value' );
		} );

		test( 'should call tracks.recordEvent', () => {
			dispatch( recordTracksEvent( 'test', { name: 'value' } ) );

			expect( mockTracks ).to.have.been.calledWithExactly( 'recordTracksEvent', 'test', {
				name: 'value',
			} );
		} );

		test( 'should call pageView.record', () => {
			dispatch( recordPageView( 'path', 'title', 'default', { name: 'value' } ) );

			expect( mockPageView ).to.have.been.calledWithExactly( 'recordPageView', 'path', 'title', {
				name: 'value',
			} );
		} );

		test( 'should call gaRecordEvent', () => {
			dispatch( recordGoogleEvent( 'category', 'action', 'label', 'value' ) );

			expect( mockGA ).to.have.been.calledWithExactly(
				'gaRecordEvent',
				'category',
				'action',
				'label',
				'value'
			);
		} );

		test( 'should call ga.recordPageView', () => {
			dispatch( recordGooglePageView( 'path', 'title' ) );

			expect( mockGA ).to.have.been.calledWithExactly( 'gaRecordPageView', 'path', 'title' );
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

			expect( mockMC ).to.have.been.calledWithExactly( 'bumpStat', 'name', 'value' );
		} );

		test( 'should call `setOptOut`', () => {
			dispatch( setTracksOptOut( false ) );

			expect( mockTracks ).to.have.been.calledWithExactly( 'setTracksOptOut', false );
		} );

		test( 'should call hotjar.addHotJarScript', () => {
			dispatch( loadTrackingTool( 'HotJar' ) );
			expect( addHotJarScript ).to.have.been.calledOnce;
		} );
	} );
} );
