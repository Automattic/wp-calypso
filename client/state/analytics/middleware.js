/**
 *  External dependencies
 *
 * @format
 */

import { has, invoke } from 'lodash';

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

const pageViewServices = {
	ga: ( { url, title } ) => analytics.ga.recordPageView( url, title ),
	default: ( { url, title, ...params } ) => analytics.pageView.record( url, title, params ),
};

const loadTrackingTool = ( { trackingTool }, state ) => {
	if ( trackingTool === 'HotJar' && ! isTracking( state, 'HotJar' ) ) {
		analytics.hotjar.addHotJarScript();
	}
};

const statBump = ( { group, name } ) => analytics.mc.bumpStat( group, name );

const setOptOut = ( { isOptingOut } ) => analytics.tracks.setOptOut( isOptingOut );

export const dispatcher = ( { meta: { analytics: analyticsMeta } }, state ) => {
	analyticsMeta.forEach( ( { type, payload } ) => {
		const { service = 'default', ...params } = payload;

		switch ( type ) {
			case ANALYTICS_EVENT_RECORD:
				return invoke( eventServices, service, params );

			case ANALYTICS_PAGE_VIEW_RECORD:
				return invoke( pageViewServices, service, params );

			case ANALYTICS_STAT_BUMP:
				return statBump( params );

			case ANALYTICS_TRACKING_ON:
				return loadTrackingTool( params, state );

			case ANALYTICS_TRACKS_OPT_OUT:
				return setOptOut( params );
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
