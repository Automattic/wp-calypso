/** @format */

/**
 * External dependencies
 */

import { curry, flatMap, get, set, isFunction, merge, property } from 'lodash';

/**
 * Internal dependencies
 */
import {
	ANALYTICS_EVENT_RECORD,
	ANALYTICS_MULTI_TRACK,
	ANALYTICS_PAGE_VIEW_RECORD,
	ANALYTICS_STAT_BUMP,
	ANALYTICS_TRACKING_ON,
	ANALYTICS_TRACKS_OPT_OUT,
} from 'state/action-types';
import { getCurrentOAuth2ClientId } from 'state/ui/oauth2-clients/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import { withEnhancers } from 'state/utils';

const mergedMetaData = ( a, b ) => [
	...get( a, 'meta.analytics', [] ),
	...get( b, 'meta.analytics', [] ),
];

const joinAnalytics = ( analytics, action ) =>
	isFunction( action )
		? dispatch => {
				dispatch( analytics );
				dispatch( action );
		  }
		: merge( {}, action, { meta: { analytics: mergedMetaData( analytics, action ) } } );

export const composeAnalytics = ( ...analytics ) => ( {
	type: ANALYTICS_MULTI_TRACK,
	meta: {
		analytics: flatMap( analytics, property( 'meta.analytics' ) ),
	},
} );

export const withAnalytics = curry( joinAnalytics );

export const bumpStat = ( group, name ) => ( {
	type: ANALYTICS_STAT_BUMP,
	meta: {
		analytics: [
			{
				type: ANALYTICS_STAT_BUMP,
				payload: { group, name },
			},
		],
	},
} );

export const recordEvent = ( service, args ) => ( {
	type: ANALYTICS_EVENT_RECORD,
	meta: {
		analytics: [
			{
				type: ANALYTICS_EVENT_RECORD,
				payload: Object.assign( {}, { service }, args ),
			},
		],
	},
} );

export const loadTrackingTool = trackingTool => ( {
	type: ANALYTICS_TRACKING_ON,
	meta: {
		analytics: [
			{
				type: ANALYTICS_TRACKING_ON,
				payload: { trackingTool },
			},
		],
	},
} );

export const setTracksOptOut = isOptingOut => ( {
	type: ANALYTICS_TRACKS_OPT_OUT,
	meta: {
		analytics: [
			{
				type: ANALYTICS_TRACKS_OPT_OUT,
				payload: { isOptingOut },
			},
		],
	},
} );

export const recordGoogleEvent = ( category, action, label, value ) =>
	recordEvent( 'ga', { category, action, label, value } );

export const recordTracksEvent = ( name, properties ) =>
	recordEvent( 'tracks', { name, properties } );

export const recordCustomFacebookConversionEvent = ( name, properties ) =>
	recordEvent( 'fb', { name, properties } );

export const recordCustomAdWordsRemarketingEvent = properties =>
	recordEvent( 'adwords', { properties } );

export const recordPageView = ( url, title, service, properties = {} ) => ( {
	type: ANALYTICS_PAGE_VIEW_RECORD,
	meta: {
		analytics: [
			{
				type: ANALYTICS_PAGE_VIEW_RECORD,
				payload: {
					service,
					url,
					title,
					...properties,
				},
			},
		],
	},
} );

export const recordGooglePageView = ( url, title ) => recordPageView( url, title, 'ga' );

/**
 * Enhances any Redux action that denotes the recording of an analytics event with an additional property which
 * specifies the type of the current selected site.
 *
 * @param {Object} action - Redux action as a plain object
 * @param {Function} getState - Redux function that can be used to retrieve the current state tree
 * @returns {Object} the new Redux action
 * @see client/state/utils/withEnhancers
 */
export const enhanceWithSiteType = ( action, getState ) => {
	const site = getSelectedSite( getState() );

	if ( site !== null ) {
		if ( action.type === ANALYTICS_EVENT_RECORD ) {
			set(
				action,
				'meta.analytics[0].payload.properties.site_type',
				site.jetpack ? 'jetpack' : 'wpcom'
			);
		} else {
			set( action, 'meta.analytics[0].payload.site_type', site.jetpack ? 'jetpack' : 'wpcom' );
		}
	}

	return action;
};

const enhanceWithClientId = ( action, getState ) => {
	const clientId = getCurrentOAuth2ClientId( getState() );

	if ( clientId ) {
		if ( action.type === ANALYTICS_EVENT_RECORD ) {
			set( action, 'meta.analytics[0].payload.properties.client_id', clientId );
		} else {
			set( action, 'meta.analytics[0].payload.client_id', clientId );
		}
	}

	return action;
};

export const recordTracksEventWithClientId = withEnhancers(
	recordTracksEvent,
	enhanceWithClientId
);
export const recordPageViewWithClientId = withEnhancers( recordPageView, enhanceWithClientId );
