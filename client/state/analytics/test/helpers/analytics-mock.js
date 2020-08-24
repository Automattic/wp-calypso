/**
 * External dependencies
 */
import { merge, set } from 'lodash';

const analyticsMocks = [
	'pageView.record',
	'tracks.recordEvent',
	'tracks.recordPageView',
	'tracks.setOptOut',
	'hotjar.addHotJarScript',
];

const adTrackingMocks = [
	'trackCustomAdWordsRemarketingEvent',
	'trackCustomFacebookConversionEvent',
];

const mcMocks = [ 'bumpStat', 'bumpStatWithPageView' ];

const gaMocks = [ 'gaRecordEvent', 'gaRecordPageView', 'gaRecordTiming' ];

const pageViewMocks = [ 'recordPageView' ];

const tracksMocks = [
	'recordTracksEvent',
	'recordTracksPageView',
	'setTracksOptOut',
	'tracksEvents',
];

const mockIt = ( spy ) => ( mock ) => set( {}, mock, ( ...args ) => spy( mock, ...args ) );

export const moduleMock = ( moduleMocks ) => ( spy ) =>
	moduleMocks.map( mockIt( spy ) ).reduce( ( mocks, mock ) => merge( mocks, mock ), {} );

export const analyticsMock = moduleMock( analyticsMocks );
export const adTrackingMock = moduleMock( adTrackingMocks );
export const mcMock = moduleMock( mcMocks );
export const gaMock = moduleMock( gaMocks );
export const pageViewMock = moduleMock( pageViewMocks );
export const tracksMock = moduleMock( tracksMocks );

export default analyticsMock;
