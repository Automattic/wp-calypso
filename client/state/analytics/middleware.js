 * External dependencies
 */
import {
	has,
	invoke,
} from 'lodash';

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
} from 'state/action-types';
import isTracking from 'state/selectors/is-tracking';
const config = require( 'config' );

const eventServices = {
	ga: ( { category, action, label, value } ) => ga.recordEvent( category, action, label, value ),
	tracks: ( { name, properties } ) => tracks.recordEvent( name, properties ),
	fb: ( { name, properties } ) => trackCustomFacebookConversionEvent( name, properties ),
	adwords: ( { properties } ) => trackCustomAdWordsRemarketingEvent( properties ),
};

const pageViewServices = {
	ga: ( { url, title } ) => analytics.ga.recordPageView( url, title ),
	'default': ( { url, title } ) => analytics.pageView.record( url, title ),
};

const loadTrackingTool = ( trackingTool, state ) => {
	const trackUser = ! navigator.doNotTrack;
	const luckyOrangeEnabled = config( 'lucky_orange_enabled' );

	if ( trackingTool === 'Lucky Orange' && ! isTracking( state, 'Lucky Orange' ) && luckyOrangeEnabled && trackUser ) {
		analytics.luckyOrange.addLuckyOrangeScript();
	}

const statBump = ( { group, name } ) => mc.bumpStat( group, name );

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
