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

export interface LandingPagePreference {
	updatedAt: number;
}

export interface SitesLandingPage extends LandingPagePreference {
	useSitesAsLandingPage: boolean;
}

export interface ReaderLandingPage extends LandingPagePreference {
	useReaderAsLandingPage: boolean;
}

export interface UserPreferences {
	'hosting-dashboard-opt-in'?: HostingDashboardOptIn;
	[ key: `hosting-dashboard-overview-storage-notice-dismissed-${ number }` ]: string | undefined; // Timestamp when the user dismissed the notice
	[ key: `hosting-dashboard-tours-${ string }` ]: string; // ISO date string when the user completed the tours
	'hosting-dashboard-welcome-notice-dismissed'?: string; // Timestamp when the user dismissed the notice
	'reader-landing-page'?: ReaderLandingPage;
	'sites-landing-page'?: SitesLandingPage;
	'sites-view'?: SitesViewPreferences;
}
