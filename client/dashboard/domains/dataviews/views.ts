import type { AnalyticsClient } from '../../app/analytics';
import type { SupportedLayouts, View } from '@wordpress/dataviews';

// Base properties that are common to all view types
const BASE_VIEW_PROPS: View = {
	type: 'table',
	layout: {
		density: 'comfortable',
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
		'expiry',
		'domain_status',
	],
};

export const DEFAULT_VIEW = BASE_VIEW_PROPS;

// Default layouts
export const DEFAULT_LAYOUTS = {
	table: {},
};

const DOMAINS_LIST_GRID_LAYOUT = {
	layout: {
		density: 'balanced' as const,
	},
	showLevels: false,
	showMedia: false,
	titleField: 'domain',
};

export const DOMAINS_LIST_LAYOUTS: SupportedLayouts = {
	table: {
		layout: {
			density: 'comfortable',
		},
		showLevels: false,
		showMedia: false,
		titleField: 'domain',
	},
	grid: DOMAINS_LIST_GRID_LAYOUT,
};

export const DOMAINS_LIST_CONFIG = {
	perPageSizes: [ 12, 24, 48, 96 ],
};

export const DOMAINS_LIST_DEFAULT_VIEW = {
	...BASE_VIEW_PROPS,
	...DOMAINS_LIST_GRID_LAYOUT,
	type: 'grid',
	perPage: 12,
} as View;

export const SITE_CONTEXT_VIEW: View = {
	...DOMAINS_LIST_DEFAULT_VIEW,
	fields: [ 'expiry', 'domain_status' ],
};

export const DOMAINS_LIST_CARDS_ONLY_MAX = 8;
const DOMAINS_LIST_CARDS_DEFAULT_MAX = 16;

// Cards suit a small portfolio, but a table is easier to scan when there are many domains.
export function withDomainsListDefaultLayout( view: View, domainCount: number ): View {
	if ( domainCount <= DOMAINS_LIST_CARDS_DEFAULT_MAX ) {
		return view;
	}

	return { ...view, type: 'table' } as View;
}

// Saved views can still list the removed SSL field, which the table would render as a blank column.
export function sanitizeDomainFields( fields: View[ 'fields' ] ) {
	return fields?.filter( ( field ) => field !== 'ssl_status' );
}

// Saved views can hold a page size from before these options, which the page size control couldn't show as selected.
export function sanitizeDomainsListPageSize( view: View ): View {
	const { perPage } = view;
	const { perPageSizes } = DOMAINS_LIST_CONFIG;
	if ( ! perPage || perPageSizes.includes( perPage ) ) {
		return view;
	}

	const nearest = perPageSizes.reduce( ( closest, size ) =>
		Math.abs( size - perPage ) < Math.abs( closest - perPage ) ? size : closest
	);
	return { ...view, perPage: nearest };
}

/*
 * DataViews renders nothing for a layout it wasn't given, including its reset control. A saved view can name one
 * when a build that offers it shares the user's preferences, or after that layout is removed, so show it as a table instead.
 */
export function sanitizeDomainsListLayout( view: View ): View {
	if ( view.type in DOMAINS_LIST_LAYOUTS ) {
		return view;
	}

	const { layout, ...viewWithoutLayout } = view;
	return { ...viewWithoutLayout, type: 'table', layout: DEFAULT_VIEW.layout } as View;
}

export function recordDomainViewChanges(
	oldView: View,
	newView: View,
	recordTracksEvent: AnalyticsClient[ 'recordTracksEvent' ]
) {
	if ( ! oldView.search && newView.search ) {
		recordTracksEvent( 'calypso_dashboard_domains_search' );
	}

	if ( oldView.type !== newView.type ) {
		recordTracksEvent( 'calypso_dashboard_domains_view_type_changed', { type: newView.type } );
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

	const oldShownFields = new Set( oldView.fields || [] );
	const newShownFields = new Set( newView.fields || [] );

	for ( const added of setDifference( newShownFields, oldShownFields ) ) {
		recordTracksEvent( 'calypso_dashboard_domains_view_field_visibility_changed', {
			change: 'added',
			field: added,
		} );
	}
	for ( const removed of setDifference( oldShownFields, newShownFields ) ) {
		recordTracksEvent( 'calypso_dashboard_domains_view_field_visibility_changed', {
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
