import * as actions from './actions';
import * as selectors from './selectors';
import type { DispatchFromMap, SelectFromMap } from '../mapped-types';

export type Location = {
	pathname: string;
	search?: string;
	hash?: string;
	state?: unknown;
	key?: string;
};

export interface SiteLogo {
	id: number;
	sizes: never[];
	url: string;
}

export interface Plan {
	product_slug: string;
}

export interface HelpCenterSite {
	ID: number | string;
	name: string;
	URL: string;
	domain: string;
	plan: Plan;
	is_wpcom_atomic: boolean;
	jetpack: boolean;
	logo: SiteLogo;
	options: {
		launchpad_screen: string;
		site_intent: string;
		admin_url: string;
	};
}

export interface Dispatch {
	dispatch: DispatchFromMap< typeof actions >;
}

export interface APIFetchOptions {
	global: boolean;
	path: string;
}

export type HelpCenterSelect = SelectFromMap< typeof selectors >;
