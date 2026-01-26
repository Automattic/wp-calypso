import * as actions from './actions';
import * as selectors from './selectors';
import type { DispatchFromMap, SelectFromMap } from '../mapped-types';

/**
 * Minimal site data needed by AgentsManager.
 *
 * Unlike HelpCenterSite which has many fields, AgentsManager only uses:
 * - ID: for JWT auth token generation
 * - domain: for support article content filtering
 */
export interface AgentsManagerSite {
	ID: number | string;
	domain: string;
}

export type Dispatch = DispatchFromMap< typeof actions >;
export type AgentsManagerSelect = SelectFromMap< typeof selectors >;
