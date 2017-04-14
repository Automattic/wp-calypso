/**
 * External dependencies
 */
import { has, invoke, get } from 'lodash';

/**
 * Internal dependencies
 */
const config = require( 'config' );
import analytics from 'lib/analytics';
import isTracking from 'state/selectors/is-tracking';
import { getSelectedSite } from 'state/ui/selectors';
import { getCurrentUser } from 'state/current-user/selectors';

import {
	ANALYTICS_EVENT_RECORD,
	ANALYTICS_PAGE_VIEW_RECORD,
	ANALYTICS_STAT_BUMP,
	ANALYTICS_TRACKING_ON,
} from 'state/action-types';

const eventServices = {
	ga: ( { category, action, label, value } ) => analytics.ga.recordEvent( category, action, label, value ),
	tracks: ( { name, properties, selectedSite, siteCount } ) => analytics.tracks.recordEvent( name, properties, selectedSite, siteCount )
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
};

const statBump = ( { group, name } ) => analytics.mc.bumpStat( group, name );

export const dispatcher = ( { meta: { analytics: analyticsMeta } }, state ) => {
	analyticsMeta.forEach( ( { type, payload } ) => {
		const { service = 'default' } = payload;

		switch ( type ) {
			case ANALYTICS_EVENT_RECORD:
				if ( payload.service === 'tracks' ) {
					const selectedSite = getSelectedSite( state );
					const user = getCurrentUser( state );
					const siteCount = get( user, 'site_count', 0 );
					return invoke( eventServices, service, { ...payload, selectedSite, siteCount } );
				}
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
