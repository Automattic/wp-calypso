import type { AnalyticsClient } from '../../app/analytics';
import type { User } from '@automattic/api-core';
import type { Operator, SortDirection, SupportedLayouts, View } from '@wordpress/dataviews';

export const DEFAULT_LAYOUTS: SupportedLayouts = {
	table: {
		layout: {
			density: 'balanced',
		},
		showLevels: false,
		showMedia: true,
		showTitle: true,
		showDescription: true,
		mediaField: 'icon.ico',
		titleField: 'name',
		descriptionField: 'URL',
	},
	grid: {
		layout: {
			previewSize: 290,
		},
		showLevels: false,
		showMedia: true,
		showTitle: true,
		showDescription: true,
		mediaField: 'preview',
		titleField: 'name',
		descriptionField: 'URL',
	},
};

export const DEFAULT_CONFIG = {
	perPageSizes: [ 12, 24, 48, 96 ],
};

export const DEFAULT_PER_PAGE = 12;

const DEFAULT_VIEW: Partial< View > = {
	perPage: DEFAULT_PER_PAGE,
	fields: [ 'visibility', 'visitors', 'subscribers_count', 'plan' ],
	sort: {
		field: 'name',
		direction: 'asc' as SortDirection,
	},
};

export function getDefaultView( {
	user,
	isAutomattician,
	isRestoringAccount,
}: {
	user: User;
	isAutomattician: boolean;
	isRestoringAccount: boolean;
} ): View {
	const type = isRestoringAccount || user.site_count > DEFAULT_PER_PAGE ? 'table' : 'grid';

	const defaultView = {
		type,
		...DEFAULT_VIEW,
		...DEFAULT_LAYOUTS[ type ],
	} as View;

	if ( isAutomattician ) {
		defaultView.filters = [
			{
				field: 'is_a8c',
				operator: 'is' as Operator,
				value: false,
			},
		];
	}

	return defaultView;
}

export function recordViewChanges(
	oldView: View,
	newView: View,
	recordTracksEvent: AnalyticsClient[ 'recordTracksEvent' ]
) {
	if ( oldView.type !== newView.type ) {
		recordTracksEvent( 'calypso_dashboard_sites_view_type_changed', { type: newView.type } );

		// Changing view type can also change fields, but they weren't triggered by a user
		// action, so we won't record those tracks events.
		return;
	}

	if (
		oldView.sort?.field !== newView.sort?.field ||
		oldView.sort?.direction !== newView.sort?.direction
	) {
		recordTracksEvent( 'calypso_dashboard_sites_view_sort_changed', {
			field: newView.sort?.field,
			direction: newView.sort?.direction,
		} );
	}

	const oldFilterFields = new Set( oldView.filters?.map( ( { field } ) => field ) || [] );
	const newFilterFields = new Set( newView.filters?.map( ( { field } ) => field ) || [] );

	for ( const added of setDifference( newFilterFields, oldFilterFields ) ) {
		recordTracksEvent( 'calypso_dashboard_sites_view_filter_changed', {
			change: 'added',
			field: added,
		} );
	}
	for ( const removed of setDifference( oldFilterFields, newFilterFields ) ) {
		recordTracksEvent( 'calypso_dashboard_sites_view_filter_changed', {
			change: 'removed',
			field: removed,
		} );
	}

	const oldShownFields = new Set( oldView.fields || [] );
	const newShownFields = new Set( newView.fields || [] );

	for ( const added of setDifference( newShownFields, oldShownFields ) ) {
		recordTracksEvent( 'calypso_dashboard_sites_view_field_visibility_changed', {
			change: 'added',
			field: added,
		} );
	}
	for ( const removed of setDifference( oldShownFields, newShownFields ) ) {
		recordTracksEvent( 'calypso_dashboard_sites_view_field_visibility_changed', {
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
