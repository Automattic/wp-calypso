import { Location } from 'history';
import * as actions from './actions';
import * as selectors from './selectors';
import type { DispatchFromMap, SelectFromMap } from '../mapped-types';

/**
 * Minimal site data needed by AgentsManager.
 */
export interface AgentsManagerSite {
	ID: number | string;
	domain: string;
	URL?: string;
	/** False when the host page knows the site doesn't use AI credits. Null when it can't tell. */
	usesAiCredits?: boolean | null;
}

export type Dispatch = DispatchFromMap< typeof actions >;
export type AgentsManagerSelect = SelectFromMap< typeof selectors >;

export type SingleRouterHistory = {
	entries: Location[];
	index: number;
};

export type PerSiteRouterHistory = Record< string, SingleRouterHistory >;

export type PerSiteLastActivity = Record< string, number >;
