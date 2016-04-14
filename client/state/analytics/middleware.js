import analytics from 'lib/analytics';
import has from 'lodash/has';
import invoke from 'lodash/invoke';

import {
	ANALYTICS_EVENT_RECORD,
	ANALYTICS_PAGE_VIEW_RECORD,
	ANALYTICS_STAT_BUMP
} from 'state/action-types';

const eventServices = {
	ga: ( { category, action, label, value } ) => analytics.ga.recordEvent( category, action, label, value ),
	tracks: ( { name, properties } ) => analytics.tracks.recordEvent( name, properties )
};

const pageViewServices = {
	ga: ( { url, title } ) => analytics.ga.recordPageView( url, title ),
	default: ( { url, title } ) => analytics.pageView.record( url, title )
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
	} )
};

export const analyticsMiddleware = () => next => action => {
	if ( has( action, 'meta.analytics' ) ) {
		dispatcher( action );
	}

	return next( action );
};

export default analyticsMiddleware;
