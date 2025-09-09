import type { ViewTable, ViewGrid } from '@wordpress/dataviews';

export type SitesView = ViewTable | ViewGrid;

// The view preferences are a subset of the view object.
// It includes the merged layout object of all view types ever explicitly set by the user.
export type SitesViewPreferences = Partial< Omit< SitesView, 'type' | 'layout' > > & {
	type?: ViewTable[ 'type' ] | ViewGrid[ 'type' ];
	layout?: Partial< ViewTable[ 'layout' ] & ViewGrid[ 'layout' ] >;
};

export interface HostingDashboardOptIn {
	value: 'unset' | 'opt-in' | 'opt-out';
	updated_at: string; // ISO date string
}

export interface UserPreferences {
	'sites-view'?: SitesViewPreferences;
	[ key: `hosting-dashboard-overview-storage-notice-dismissed-${ number }` ]: string | undefined; // Timestamp when the user dismissed the notice
	'hosting-dashboard-opt-in'?: HostingDashboardOptIn;
}
