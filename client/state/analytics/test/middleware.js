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
import {
	trackCustomFacebookConversionEvent,
	trackCustomAdWordsRemarketingEvent,
} from 'calypso/lib/analytics/ad-tracking';
import { bumpStat as mcBumpStat } from 'calypso/lib/analytics/mc';
import { gaRecordPageView, gaRecordEvent } from 'calypso/lib/analytics/ga';
import { recordPageView as pageviewRecordPageView } from 'calypso/lib/analytics/page-view';
import {
	setTracksOptOut as tracksSetTracksOptOut,
	recordTracksEvent as tracksRecordTracksEvent,
} from 'calypso/lib/analytics/tracks';
import { addHotJarScript } from 'calypso/lib/analytics/hotjar';

const noop = () => {};

jest.mock( 'calypso/lib/analytics/page-view', () => ( {
	recordPageView: jest.fn(),
} ) );

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	setTracksOptOut: jest.fn(),
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( 'calypso/lib/analytics/ad-tracking', () => ( {
	trackCustomFacebookConversionEvent: jest.fn(),
	trackCustomAdWordsRemarketingEvent: jest.fn(),
} ) );

jest.mock( 'calypso/lib/analytics/mc', () => ( {
	bumpStat: jest.fn(),
} ) );

jest.mock( 'calypso/lib/analytics/ga', () => ( {
	gaRecordPageView: jest.fn(),
	gaRecordEvent: jest.fn(),
} ) );

jest.mock( 'calypso/lib/analytics/hotjar', () => ( {
	addHotJarScript: jest.fn(),
} ) );

const dispatch = analyticsMiddleware()( noop );

describe( 'middleware', () => {
	describe( 'analytics dispatching', () => {
		beforeEach( () => {
			jest.resetAllMocks();
		} );

		test( 'should call mc.bumpStat', () => {
			dispatch( bumpStat( 'test', 'value' ) );

			expect( mcBumpStat ).toHaveBeenCalledWith( 'test', 'value' );
		} );

		test( 'should call tracks.recordEvent', () => {
			dispatch( recordTracksEvent( 'test', { name: 'value' } ) );

			expect( tracksRecordTracksEvent ).toHaveBeenCalledWith( 'test', {
				name: 'value',
			} );
		} );

		test( 'should call pageView.record', () => {
			dispatch( recordPageView( 'path', 'title', 'default', { name: 'value' } ) );

			expect( pageviewRecordPageView ).toHaveBeenCalledWith( 'path', 'title', {
				name: 'value',
			} );
		} );

		test( 'should call gaRecordEvent', () => {
			dispatch( recordGoogleEvent( 'category', 'action', 'label', 'value' ) );

			expect( gaRecordEvent ).toHaveBeenCalledWith( 'category', 'action', 'label', 'value' );
		} );

		test( 'should call ga.recordPageView', () => {
			dispatch( recordGooglePageView( 'path', 'title' ) );

			expect( gaRecordPageView ).toHaveBeenCalledWith( 'path', 'title' );
		} );

		test( 'should call trackCustomFacebookConversionEvent', () => {
			dispatch( recordCustomFacebookConversionEvent( 'event', { name: 'value' } ) );

			expect( trackCustomFacebookConversionEvent ).toHaveBeenCalledWith( 'event', {
				name: 'value',
			} );
		} );

		test( 'should call trackCustomAdWordsRemarketingEvent', () => {
			dispatch( recordCustomAdWordsRemarketingEvent( { name: 'value' } ) );

			expect( trackCustomAdWordsRemarketingEvent ).toHaveBeenCalledWith( { name: 'value' } );
		} );

		test( 'should call analytics events with wrapped actions', () => {
			dispatch( withAnalytics( bumpStat( 'name', 'value' ), { type: 'TEST_ACTION' } ) );

			expect( mcBumpStat ).toHaveBeenCalledWith( 'name', 'value' );
		} );

		test( 'should call `setOptOut`', () => {
			dispatch( setTracksOptOut( false ) );

			expect( tracksSetTracksOptOut ).toHaveBeenCalledWith( false );
		} );

		test( 'should call hotjar.addHotJarScript', () => {
			dispatch( loadTrackingTool( 'HotJar' ) );
			expect( addHotJarScript ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
