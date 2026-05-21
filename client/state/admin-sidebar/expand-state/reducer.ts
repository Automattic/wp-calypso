/**
 * Per-user, per-site, per-group expand/collapse state for the redesigned
 * admin sidebar.
 *
 * Mirrors the public plugin's `expand-collapse.js` sessionStorage shape
 * (`wp-admin-sidebar:groups:<site_id> = { "plugins": true, ... }`) but
 * lives in Redux state so:
 *
 *   - Persistence is unified with the rest of Calypso's per-user state
 *     (`withPersistence` + the `adminSidebar` storage key).
 *   - The browser-tab-only nature of sessionStorage is exchanged for
 *     cross-tab continuity within the same user session — closer to the
 *     Decision logged 2026-04-29 (per-`siteId` keying via Redux, see
 *     `a3-planning.md` § Task 1.4).
 *
 * Server-side persistence (the user-pref-style POST that Phase 2 task 2.3
 * wires alongside Save in customize mode) is intentionally NOT in this
 * slice's responsibility yet — it'll join in Phase 2 via a side-effect
 * thunk. Today the slice is local + persisted to client storage.
 */

import { withStorageKey } from '@automattic/state-utils';
import {
	ADMIN_SIDEBAR_GROUP_TOGGLE,
	ADMIN_SIDEBAR_GROUP_SET_EXPANDED,
} from 'calypso/state/action-types';
import { combineReducers, withPersistence, withSchemaValidation } from 'calypso/state/utils';
import { adminSidebarExpandStateSchema } from './schema';

type ExpandStateBySite = Record< string, Record< string, boolean > >;

type ToggleAction = {
	type: typeof ADMIN_SIDEBAR_GROUP_TOGGLE;
	siteId: number | string;
	groupId: string;
};

type SetExpandedAction = {
	type: typeof ADMIN_SIDEBAR_GROUP_SET_EXPANDED;
	siteId: number | string;
	groupId: string;
	expanded: boolean;
};

type AnyAction = ToggleAction | SetExpandedAction | { type: string };

const initialState: ExpandStateBySite = {};

const baseReducer = (
	state: ExpandStateBySite = initialState,
	action: AnyAction
): ExpandStateBySite => {
	switch ( action.type ) {
		case ADMIN_SIDEBAR_GROUP_TOGGLE: {
			const { siteId, groupId } = action as ToggleAction;
			const key = String( siteId );
			const current = state[ key ]?.[ groupId ];
			// Default-to-collapsed when missing, then flip. The component reads
			// the group's `default_expanded` separately — this slice only stores
			// user-driven overrides, but a toggle from "no entry" treats absent
			// as `false` (the public plugin's behaviour at first interaction).
			const next = ! current;
			return {
				...state,
				[ key ]: {
					...state[ key ],
					[ groupId ]: next,
				},
			};
		}
		case ADMIN_SIDEBAR_GROUP_SET_EXPANDED: {
			const { siteId, groupId, expanded } = action as SetExpandedAction;
			const key = String( siteId );
			if ( state[ key ]?.[ groupId ] === expanded ) {
				return state;
			}
			return {
				...state,
				[ key ]: {
					...state[ key ],
					[ groupId ]: expanded,
				},
			};
		}
		default:
			return state;
	}
};

export const bySite = withSchemaValidation(
	adminSidebarExpandStateSchema,
	withPersistence( baseReducer )
);

const reducer = combineReducers( {
	bySite,
} );

export default withStorageKey( 'adminSidebarExpandState', reducer );
