import type { View } from '@wordpress/dataviews';

export interface HostingDashboardOptIn {
	value: 'unset' | 'opt-in' | 'opt-out';
	updated_at: string; // ISO date string
}

export interface LandingPagePreference {
	updatedAt: number; // Result of Date.now()
}

export interface SitesLandingPage extends LandingPagePreference {
	useSitesAsLandingPage: boolean;
}

export interface ReaderLandingPage extends LandingPagePreference {
	useReaderAsLandingPage: boolean;
}

export interface UserPreferences {
	'hosting-dashboard-opt-in'?: HostingDashboardOptIn;
	[ key: `hosting-dashboard-dataviews-view-${ string }` ]: View | undefined;
	[ key: `hosting-dashboard-overview-storage-notice-dismissed-${ number }` ]: string | undefined; // Timestamp when the user dismissed the notice
	[ key: `hosting-dashboard-tours-${ string }` ]: string; // ISO date string when the user completed the tours
	'hosting-dashboard-welcome-notice-dismissed'?: string; // Timestamp when the user dismissed the notice
	'reader-landing-page'?: ReaderLandingPage;
	'sites-landing-page'?: SitesLandingPage;
	[ key: `cancel-purchase-survey-completed-${ string | number }` ]: string | undefined;
}
