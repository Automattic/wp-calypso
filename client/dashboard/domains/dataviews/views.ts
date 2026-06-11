import type { AnalyticsClient } from '../../app/analytics';
import type { View } from '@wordpress/dataviews';

// Base properties that are common to all view types
const BASE_VIEW_PROPS: View = {
	type: 'table',
	layout: {
		density: 'balanced',
	},
	sort: {
		field: 'domain',
		direction: 'asc',
	},
	perPage: 10,
	showLevels: false,
	showMedia: false,
	titleField: 'domain',
	fields: [
		// 'owner',
		'blog_name',
		'ssl_status',
		'expiry',
		'domain_status',
	],
};

export const DEFAULT_VIEW = BASE_VIEW_PROPS;

export const SITE_CONTEXT_VIEW = {
	...BASE_VIEW_PROPS,
	fields: [ 'ssl_status', 'expiry', 'domain_status' ],
};

// Default layouts
export const DEFAULT_LAYOUTS = {
	table: {},
};

export function recordDomainViewChanges(
	oldView: View,
	newView: View,
	recordTracksEvent: AnalyticsClient[ 'recordTracksEvent' ]
) {
	if ( oldView.type !== newView.type ) {
		recordTracksEvent( 'calypso_dashboard_domains_view_type_changed', { type: newView.type } );
		return;
	}

	if (
		oldView.sort?.field !== newView.sort?.field ||
		oldView.sort?.direction !== newView.sort?.direction
	) {
		recordTracksEvent( 'calypso_dashboard_domains_view_sort_changed', {
			field: newView.sort?.field,
			direction: newView.sort?.direction,
		} );
	}

	const oldFilterFields = new Set( oldView.filters?.map( ( { field } ) => field ) || [] );
	const newFilterFields = new Set( newView.filters?.map( ( { field } ) => field ) || [] );

	for ( const added of setDifference( newFilterFields, oldFilterFields ) ) {
		recordTracksEvent( 'calypso_dashboard_domains_view_filter_changed', {
			change: 'added',
			field: added,
		} );
	}
	for ( const removed of setDifference( oldFilterFields, newFilterFields ) ) {
		recordTracksEvent( 'calypso_dashboard_domains_view_filter_changed', {
			change: 'removed',
			field: removed,
		} );
	}
}

// Ponyfill for Set.prototype.difference, which is not available in all target environments.
function setDifference< T >( a: Set< T >, b: Set< T > ): Set< T > {
	const difference = new Set( a );
	for ( const item of b ) {
		difference.delete( item );
	}
	return difference;
}
