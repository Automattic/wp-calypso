import curry from 'lodash/curry';
import isFunction from 'lodash/isFunction';
import merge from 'lodash/merge';

import {
	ANALYTICS_EVENT_RECORD,
	ANALYTICS_PAGE_VIEW_RECORD,
	ANALYTICS_STAT_BUMP
} from 'state/action-types';

const joinAnalytics = ( analytics, action ) =>
	isFunction( action )
		? dispatch => { dispatch( analytics ); action( dispatch ); }
		: merge( {}, action, { meta: analytics.meta } );

export const withAnalytics = curry( joinAnalytics );

export const bumpStat = ( group, name ) => ( {
	type: ANALYTICS_STAT_BUMP,
	meta: {
		analytics: {
			type: ANALYTICS_STAT_BUMP,
			payload: { group, name }
		}
	}
} );

export const recordEvent = ( service, args ) => ( {
	type: ANALYTICS_EVENT_RECORD,
	meta: {
		analytics: {
			type: ANALYTICS_EVENT_RECORD,
			payload: Object.assign( {}, { service }, args )
		}
	}
} );

export const recordGoogleEvent = ( category, action, label, value ) =>
	recordEvent( 'ga', { category, action, label, value } );

export const recordTracksEvent = ( name, properties ) =>
	recordEvent( 'tracks', { name, properties } );

export const recordPageView = ( url, title, service ) => ( {
	type: ANALYTICS_PAGE_VIEW_RECORD,
	meta: {
		analytics: {
			type: ANALYTICS_PAGE_VIEW_RECORD,
			payload: {
				service,
				url,
				title
			}
		}
	}
} );

export const recordGooglePageView = ( url, title ) =>
	recordPageView( url, title, 'ga' );
