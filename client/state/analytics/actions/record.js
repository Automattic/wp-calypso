import { ANALYTICS_EVENT_RECORD, ANALYTICS_PAGE_VIEW_RECORD } from 'calypso/state/action-types';
import { enhanceWithSiteMainProduct } from 'calypso/state/analytics/actions';
import { withEnhancers } from 'calypso/state/utils';

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

export const recordPageViewBasic = ( url, title, service, properties = {}, options = {} ) => ( {
	type: ANALYTICS_PAGE_VIEW_RECORD,
	meta: {
		analytics: [
			{
				type: ANALYTICS_PAGE_VIEW_RECORD,
				payload: {
					service,
					url,
					title,
					options,
					...properties,
				},
			},
		],
	},
} );

export const recordPageView = withEnhancers( recordPageViewBasic, [ enhanceWithSiteMainProduct ] );

export const recordGooglePageView = ( url, title ) => recordPageView( url, title, 'ga' );
