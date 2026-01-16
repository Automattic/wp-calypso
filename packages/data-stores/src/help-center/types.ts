import * as actions from './actions';
import * as selectors from './selectors';
import type { DispatchFromMap, SelectFromMap } from '../mapped-types';
import type { HelpCenterAction } from './actions';
import type { Location } from 'history';
export interface HelpCenterShowOptions {
	hasPremiumSupport: boolean;
	hideBackButton: boolean;
	contextTerm: string;
}
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
	site_owner: number;
	options: {
		launchpad_screen: string;
		site_intent: string;
		admin_url: string;
	};
}

export interface Dispatch {
	dispatch: DispatchFromMap< typeof actions >;
}

export type HelpCenterSelect = SelectFromMap< typeof selectors > & {
	isResolving: ( key: string ) => boolean;
};

export type HelpCenterThunkDispatch = ( action: HelpCenterAction ) => void;

export type HelpCenterThunkProps = {
	dispatch: HelpCenterThunkDispatch;
	select: HelpCenterSelect;
};

export interface HelpCenterOptions {
	hideBackButton?: boolean;
}

export interface Preferences {
	calypso_preferences: {
		help_center_open: boolean | undefined;
		help_center_minimized: boolean;
		help_center_router_history: {
			entries: Location[];
			index: number;
		} | null;
	};
}
