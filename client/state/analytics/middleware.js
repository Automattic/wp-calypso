/**
 * External dependencies
 */
import { has, invoke } from 'lodash';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';

import {
	ANALYTICS_EVENT_RECORD,
	ANALYTICS_PAGE_VIEW_RECORD,
	ANALYTICS_STAT_BUMP
} from 'state/action-types';

import { joinAnalytics } from './actions';

import actionHandlers from './action-handlers';

const eventServices = {
	ga: ( { category, action, label, value } ) => analytics.ga.recordEvent( category, action, label, value ),
	tracks: ( { name, properties } ) => analytics.tracks.recordEvent( name, properties )
};

const pageViewServices = {
	ga: ( { url, title } ) => analytics.ga.recordPageView( url, title ),
	'default': ( { url, title } ) => analytics.pageView.record( url, title )
};

const statBump = ( { group, name } ) => analytics.mc.bumpStat( group, name );

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
		}
	} );
};

export const analyticsMiddleware = store => next => action => {
	const trackers = actionHandlers.hasOwnProperty( action.type )
		? actionHandlers.map( handler => handler( store, action ) ).reduce( joinAnalytics, {} )
		: [];

	if ( trackers.length || has( action, 'meta.analytics' ) ) {
		dispatcher( joinAnalytics( trackers, action ) );
	}

	return next( action );
};

export default analyticsMiddleware;
