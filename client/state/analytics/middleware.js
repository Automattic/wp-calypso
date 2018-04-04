/**
 *  External dependencies
 *
 * @format
 */

import { flowRight, has, invoke, isNil, omit, omitBy, partialRight } from 'lodash';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import {
	trackCustomAdWordsRemarketingEvent,
	trackCustomFacebookConversionEvent,
} from 'lib/analytics/ad-tracking';
import {
	ANALYTICS_EVENT_RECORD,
	ANALYTICS_PAGE_VIEW_RECORD,
	ANALYTICS_STAT_BUMP,
	ANALYTICS_TRACKING_ON,
	ANALYTICS_TRACKS_OPT_OUT,
} from 'state/action-types';
import isTracking from 'state/selectors/is-tracking';

const eventServices = {
	ga: ( { category, action, label, value } ) =>
		analytics.ga.recordEvent( category, action, label, value ),
	tracks: ( { name, properties } ) => analytics.tracks.recordEvent( name, properties ),
	fb: ( { name, properties } ) => trackCustomFacebookConversionEvent( name, properties ),
	adwords: ( { properties } ) => trackCustomAdWordsRemarketingEvent( properties ),
};

// list of unsafe params that need to be blocked from beign passed down to the recorder.
const PAGE_VIEW_SERVICES_BLOCKED_PARAMS = [ 'service' ];

const omitUnsafeParams = flowRight(
	partialRight( omitBy, isNil ),
	partialRight( omit, PAGE_VIEW_SERVICES_BLOCKED_PARAMS )
);

const pageViewServices = {
	ga: ( { url, title } ) => analytics.ga.recordPageView( url, title ),
	default: ( { url, title, ...params } ) =>
		analytics.pageView.record( url, title, omitUnsafeParams( params ) ),
};

const loadTrackingTool = ( trackingTool, state ) => {
	if ( trackingTool === 'HotJar' && ! isTracking( state, 'HotJar' ) ) {
		analytics.hotjar.addHotJarScript();
	}
};

const statBump = ( { group, name } ) => analytics.mc.bumpStat( group, name );

export const dispatcher = ( { meta: { analytics: analyticsMeta } }, state ) => {
	analyticsMeta.forEach( ( { type, payload } ) => {
		const { service = 'default' } = payload;

		switch ( type ) {
			case ANALYTICS_EVENT_RECORD:
				return invoke( eventServices, service, payload );

			case ANALYTICS_PAGE_VIEW_RECORD:
				return invoke( pageViewServices, service, payload );

			case ANALYTICS_STAT_BUMP:
				return statBump( payload );

			case ANALYTICS_TRACKING_ON:
				return loadTrackingTool( payload, state );

			case ANALYTICS_TRACKS_OPT_OUT:
				return analytics.tracks.setOptOut( payload );
		}
	} );
};

export const analyticsMiddleware = store => next => action => {
	if ( has( action, 'meta.analytics' ) ) {
		dispatcher( action, store.getState() );
	}

	return next( action );
};

export default analyticsMiddleware;
