/**
 * Per-user, per-site saved layout-delta state for the redesigned admin
 * sidebar customize mode.
 *
 * Mirrors the public plugin's saved-delta lifecycle (`Sidebar_Rest::handle_get`
 * + `handle_post` and the in-flight `customizer/draft-state.js`):
 *
 * - Bootstrapped on customize-mode entry (GET `/wpcom/v2/wp-admin-sidebar/layout`).
 * - Replaced atomically on Save (POST `/wpcom/v2/wp-admin-sidebar/layout`).
 * - Read by the renderer to apply overrides over the baseline menu.
 *
 * Persistence is unified with the rest of Calypso's per-user state via
 * `withPersistence` and the `adminSidebar` storage key (re-used across
 * `expand-state` and this `layout` slice). Server-side persistence already
 * lives at the REST endpoint; this slice is the local mirror.
 * @see WordPress/wp-admin-sidebar v0.1.4 src/class-sidebar-rest.php
 * @see WordPress/wp-admin-sidebar v0.1.4 src/customizer/draft-state.js
 */

import { withStorageKey } from '@automattic/state-utils';
import {
	ADMIN_SIDEBAR_LAYOUT_RECEIVE,
	ADMIN_SIDEBAR_LAYOUT_CLEAR,
} from 'calypso/state/action-types';
import { combineReducers, withPersistence, withSchemaValidation } from 'calypso/state/utils';
import { adminSidebarLayoutSchema } from './schema';
import type { LayoutDelta } from './types';

type LayoutBySite = Record< string, LayoutDelta >;

type ReceiveAction = {
	type: typeof ADMIN_SIDEBAR_LAYOUT_RECEIVE;
	siteId: number | string;
	delta: LayoutDelta;
};

type ClearAction = {
	type: typeof ADMIN_SIDEBAR_LAYOUT_CLEAR;
	siteId: number | string;
};

type AnyAction = ReceiveAction | ClearAction | { type: string };

const initialState: LayoutBySite = {};

const baseReducer = ( state: LayoutBySite = initialState, action: AnyAction ): LayoutBySite => {
	switch ( action.type ) {
		case ADMIN_SIDEBAR_LAYOUT_RECEIVE: {
			const { siteId, delta } = action as ReceiveAction;
			const key = String( siteId );
			return {
				...state,
				[ key ]: delta,
			};
		}
		case ADMIN_SIDEBAR_LAYOUT_CLEAR: {
			const { siteId } = action as ClearAction;
			const key = String( siteId );
			if ( ! ( key in state ) ) {
				return state;
			}
			const next = { ...state };
			delete next[ key ];
			return next;
		}
		default:
			return state;
	}
};

export const bySite = withSchemaValidation(
	adminSidebarLayoutSchema,
	withPersistence( baseReducer )
);

const reducer = combineReducers( {
	bySite,
} );

export default withStorageKey( 'adminSidebarLayout', reducer );
