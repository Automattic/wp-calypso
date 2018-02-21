/** @format */

/**
 * External dependencies
 */

import { merge, set } from 'lodash';

const analyticsMocks = [
	'ga.recordEvent',
	'ga.recordPageView',
	'mc.bumpStat',
	'pageView.record',
	'tracks.recordEvent',
	'tracks.recordPageView',
	'tracks.setAnonymousUserId',
	'tracks.optOut',
];

const adTrackingMocks = [
	'trackCustomAdWordsRemarketingEvent',
	'trackCustomFacebookConversionEvent',
];

const mockIt = spy => mock => set( {}, mock, () => spy( mock ) );

export const moduleMock = moduleMocks => spy =>
	moduleMocks.map( mockIt( spy ) ).reduce( ( mocks, mock ) => merge( mocks, mock ), {} );

export const analyticsMock = moduleMock( analyticsMocks );
export const adTrackingMock = moduleMock( adTrackingMocks );

export default analyticsMock;
