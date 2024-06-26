import {
	trackCustomAdWordsRemarketingEvent,
	trackCustomFacebookConversionEvent,
} from 'calypso/lib/analytics/ad-tracking';
import { gaRecordEvent, gaRecordPageView } from 'calypso/lib/analytics/ga';
import { addHotJarScript } from 'calypso/lib/analytics/hotjar';
import { maybeAddLogRocketScript } from 'calypso/lib/analytics/logrocket';
import { bumpStat } from 'calypso/lib/analytics/mc';
import { recordPageView } from 'calypso/lib/analytics/page-view';
import { recordTracksEvent, setTracksOptOut } from 'calypso/lib/analytics/tracks';
import {
	ANALYTICS_EVENT_RECORD,
	ANALYTICS_PAGE_VIEW_RECORD,
	ANALYTICS_STAT_BUMP,
	ANALYTICS_TRACKING_ON,
	ANALYTICS_TRACKS_OPT_OUT,
} from 'calypso/state/action-types';

const eventServices = {
	ga: ( { category, action, label, value } ) => gaRecordEvent( category, action, label, value ),
	tracks: ( { name, properties } ) => recordTracksEvent( name, properties ),
	fb: ( { name, properties } ) => trackCustomFacebookConversionEvent( name, properties ),
	adwords: ( { properties } ) => trackCustomAdWordsRemarketingEvent( properties ),
};

const pageViewServices = {
	ga: ( { url, title } ) => gaRecordPageView( url, title ),
	default: ( { url, title, options, ...params } ) => recordPageView( url, title, params, options ),
};

const loadTrackingTool = ( trackingTool ) => {
	if ( trackingTool === 'HotJar' ) {
		addHotJarScript();
	}

	if ( trackingTool === 'LogRocket' ) {
		maybeAddLogRocketScript();
	}
};

const statBump = ( { group, name } ) => bumpStat( group, name );

const dispatcher = ( action ) => {
	const analyticsMeta = action.meta.analytics;
	analyticsMeta.forEach( ( { type, payload } ) => {
		const { service = 'default', ...params } = payload;

		switch ( type ) {
			case ANALYTICS_EVENT_RECORD:
				return eventServices[ service ]?.( params );

			case ANALYTICS_PAGE_VIEW_RECORD:
				return pageViewServices[ service ]?.( params );

			case ANALYTICS_STAT_BUMP:
				return statBump( params );
		}
	} );
};

export const analyticsMiddleware = () => ( next ) => ( action ) => {
	switch ( action.type ) {
		case ANALYTICS_TRACKING_ON:
			loadTrackingTool( action.trackingTool );
			return;

		case ANALYTICS_TRACKS_OPT_OUT:
			setTracksOptOut( action.isOptingOut );
			return;

		default:
			if ( action.meta?.analytics ) {
				dispatcher( action );
			}
	}

	return next( action );
};

export default analyticsMiddleware;
