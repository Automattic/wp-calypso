/**
 * Internal dependencies
 */
import { ANALYTICS_EVENT_RECORD, ANALYTICS_PAGE_VIEW_RECORD } from 'state/action-types';

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

export const recordGoogleEvent = ( category, action, label, value ) =>
	recordEvent( 'ga', { category, action, label, value } );

export const recordTracksEvent = ( name, properties ) =>
	recordEvent( 'tracks', { name, properties } );

export const recordCustomFacebookConversionEvent = ( name, properties ) =>
	recordEvent( 'fb', { name, properties } );

export const recordCustomAdWordsRemarketingEvent = ( properties ) =>
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
