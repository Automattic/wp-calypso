/**
 *  External dependencies
 *
 */

import { has, invoke } from 'lodash';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { addHotJarScript } from 'lib/analytics/hotjar';
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

const loadTrackingTool = trackingTool => {
	if ( trackingTool === 'HotJar' ) {
		addHotJarScript();
	}
};

const statBump = ( { group, name } ) => analytics.mc.bumpStat( group, name );

const dispatcher = action => {
	const analyticsMeta = action.meta.analytics;
	analyticsMeta.forEach( ( { type, payload } ) => {
		const { service = 'default', ...params } = payload;

		switch ( type ) {
			case ANALYTICS_EVENT_RECORD:
				return invoke( eventServices, service, params );

			case ANALYTICS_PAGE_VIEW_RECORD:
				return invoke( pageViewServices, service, params );

			case ANALYTICS_STAT_BUMP:
				return statBump( params );
		}
	} );
};

export const analyticsMiddleware = () => next => action => {
	switch ( action.type ) {
		case ANALYTICS_TRACKING_ON:
			loadTrackingTool( action.trackingTool );
			return;

		case ANALYTICS_TRACKS_OPT_OUT:
			analytics.tracks.setOptOut( action.isOptingOut );
			return;

		default:
			if ( has( action, 'meta.analytics' ) ) {
				dispatcher( action );
			}
	}

	return next( action );
};

export default analyticsMiddleware;
