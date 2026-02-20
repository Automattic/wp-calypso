import * as actions from './actions';
import * as selectors from './selectors';
import type { DispatchFromMap, SelectFromMap } from '../mapped-types';

/**
 * Minimal site data needed by AgentsManager.
 */
export interface AgentsManagerSite {
	ID: number | string;
	domain: string;
}

export type Dispatch = DispatchFromMap< typeof actions >;
export type AgentsManagerSelect = SelectFromMap< typeof selectors >;
