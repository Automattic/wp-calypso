/**
 * Internal dependencies
 */
const config = require( 'config' );
import has from 'lodash/has';
import invoke from 'lodash/invoke';
import { ga, luckyOrange, tracks, pageView, mc } from 'lib/analytics';

import {
	ANALYTICS_EVENT_RECORD,
	ANALYTICS_PAGE_VIEW_RECORD,
	ANALYTICS_STAT_BUMP,
	ANALYTICS_TRACKING_ON,
} from 'state/action-types';

const eventServices = {
	ga: ( { category, action, label, value } ) => ga.recordEvent( category, action, label, value ),
	tracks: ( { name, properties } ) => tracks.recordEvent( name, properties )
};

const pageViewServices = {
	ga: ( { url, title } ) => ga.recordPageView( url, title ),
	'default': ( { url, title } ) => pageView.record( url, title ),
};

const loadTrackingTool = ( trackingTool ) => {
	const trackUser = ! navigator.doNotTrack;
	const luckyOrangeEnabled = config( 'lucky_orange_enabled' );

	if ( trackingTool === 'Lucky Orange' && luckyOrangeEnabled && trackUser ) {
		luckyOrange.addLuckyOrangeScript();
	}
};

const statBump = ( { group, name } ) => mc.bumpStat( group, name );

export const dispatcher = ( { meta: { analytics } } ) => {
	analytics.forEach( ( { type, payload } ) => {
		const { service = 'default' } = payload;

		switch ( type ) {
			case ANALYTICS_EVENT_RECORD:
				return invoke( eventServices, service, payload );

			case ANALYTICS_PAGE_VIEW_RECORD:
				return invoke( pageViewServices, service, payload );

			case ANALYTICS_STAT_BUMP:
				return statBump( payload );

			case ANALYTICS_TRACKING_ON:
				return loadTrackingTool( payload );
		}
	} );
};

export const analyticsMiddleware = () => next => action => {
	if ( has( action, 'meta.analytics' ) ) {
		dispatcher( action );
	}

	return next( action );
};

export default analyticsMiddleware;
