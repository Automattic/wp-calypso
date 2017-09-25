/**
 * External dependencies
 */
import { has, invoke } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import analytics from 'lib/analytics';
import { trackCustomAdWordsRemarketingEvent, trackCustomFacebookConversionEvent } from 'lib/analytics/ad-tracking';
import { doNotTrack } from 'lib/analytics/utils';
import { ANALYTICS_EVENT_RECORD, ANALYTICS_PAGE_VIEW_RECORD, ANALYTICS_STAT_BUMP, ANALYTICS_TRACKING_ON, ANALYTICS_TRACKS_ANONID_SET } from 'state/action-types';
import isTracking from 'state/selectors/is-tracking';

const eventServices = {
	ga: ( { category, action, label, value } ) => analytics.ga.recordEvent( category, action, label, value ),
	tracks: ( { name, properties } ) => analytics.tracks.recordEvent( name, properties ),
	fb: ( { name, properties } ) => trackCustomFacebookConversionEvent( name, properties ),
	adwords: ( { properties } ) => trackCustomAdWordsRemarketingEvent( properties ),
};

const pageViewServices = {
	ga: ( { url, title } ) => analytics.ga.recordPageView( url, title ),
	'default': ( { url, title } ) => analytics.pageView.record( url, title ),
};

const loadTrackingTool = ( trackingTool, state ) => {
	const trackUser = ! doNotTrack();
	const hotJarEnabled = config( 'hotjar_enabled' );

	if ( trackingTool === 'HotJar' && ! isTracking( state, 'HotJar' ) && hotJarEnabled && trackUser ) {
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

			case ANALYTICS_TRACKS_ANONID_SET:
				return analytics.tracks.setAnonymousUserId( payload );

			case ANALYTICS_STAT_BUMP:
				return statBump( payload );

			case ANALYTICS_TRACKING_ON:
				return loadTrackingTool( payload, state );
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
