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
	ANALYTICS_TRACKS_ANONID_SET,
	ANALYTICS_TRACKS_OPT_OUT,
} from 'state/action-types';

import { getCurrentOAuth2ClientId } from 'state/ui/oauth2-clients/selectors';

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

export const setTracksAnonymousUserId = anonId => ( {
	type: ANALYTICS_TRACKS_ANONID_SET,
	meta: {
		analytics: [
			{
				type: ANALYTICS_TRACKS_ANONID_SET,
				payload: anonId,
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
				payload: trackingTool,
			},
		],
	},
} );

export const optOutTracks = isOptingOut => ( {
	type: ANALYTICS_TRACKS_OPT_OUT,
	meta: {
		analytics: [
			{
				type: ANALYTICS_TRACKS_OPT_OUT,
				payload: isOptingOut,
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

export const recordPageView = ( url, title, service ) => ( {
	type: ANALYTICS_PAGE_VIEW_RECORD,
	meta: {
		analytics: [
			{
				type: ANALYTICS_PAGE_VIEW_RECORD,
				payload: {
					service,
					url,
					title,
				},
			},
		],
	},
} );

export const recordGooglePageView = ( url, title ) => recordPageView( url, title, 'ga' );

const withClientId = actionCreator => ( ...args ) => ( dispatch, getState ) => {
	const action = actionCreator( ...args );

	if ( typeof action !== 'object' ) {
		throw new Error(
			'withClientId only works with action creators that return plain action object'
		);
	}

	const clientId = getCurrentOAuth2ClientId( getState() );

	if ( clientId ) {
		set(
			action,
			action.type === ANALYTICS_EVENT_RECORD
				? 'meta.analytics[0].payload.properties.client_id'
				: 'meta.analytics[0].payload.client_id',
			clientId
		);
	}

	return dispatch( action );
};

export const recordTracksEventWithClientId = withClientId( recordTracksEvent );
export const recordPageViewWithClientId = withClientId( recordPageView );
