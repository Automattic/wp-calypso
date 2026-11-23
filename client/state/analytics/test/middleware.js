import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { addHotJarScript } from 'calypso/lib/analytics/hotjar';
import { bumpStat as mcBumpStat } from 'calypso/lib/analytics/mc';
import { recordPageView as pageviewRecordPageView } from 'calypso/lib/analytics/page-view';
import { recordTracksEvent as tracksRecordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	withAnalytics,
	bumpStat,
	recordGoogleEvent,
	recordTracksEvent,
	recordPageView,
	loadTrackingTool,
} from '../actions';
import { analyticsMiddleware } from '../middleware.js';

const noop = () => {};

jest.mock( 'calypso/lib/analytics/page-view', () => ( {
	recordPageView: jest.fn(),
} ) );

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
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

			expect( pageviewRecordPageView ).toHaveBeenCalledWith(
				'path',
				'title',
				{
					name: 'value',
				},
				{}
			);
		} );

		test( 'should call gaRecordEvent', () => {
			dispatch( recordGoogleEvent( 'category', 'action', 'label', 'value' ) );

			expect( gaRecordEvent ).toHaveBeenCalledWith( 'category', 'action', 'label', 'value' );
		} );

		test( 'should call analytics events with wrapped actions', () => {
			dispatch( withAnalytics( bumpStat( 'name', 'value' ), { type: 'TEST_ACTION' } ) );

			expect( mcBumpStat ).toHaveBeenCalledWith( 'name', 'value' );
		} );

		test( 'should call hotjar.addHotJarScript', () => {
			dispatch( loadTrackingTool( 'HotJar' ) );
			expect( addHotJarScript ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
