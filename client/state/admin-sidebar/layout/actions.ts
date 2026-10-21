/**
 * Action creators for the admin-sidebar layout-delta slice.
 *
 * The slice is the Calypso-side counterpart to the public plugin's saved
 * `LayoutDelta` (per `WordPress/wp-admin-sidebar` v0.1.4
 * `src/customizer/draft-state.js`). One action drops a fresh delta into
 * state per `(siteId)`, another clears it (Cancel + dirty path doesn't
 * actually clear because the cancel discards the working delta only — the
 * saved delta in state stays untouched. `clear` exists for sign-out / GET
 * 404 / explicit reset paths).
 *
 * The actual REST POST flow (Save in customize mode) is wired in
 * `client/my-sites/sidebar/customize/save-flow.js`; this slice just
 * receives the persisted delta on success.
 * @see WordPress/wp-admin-sidebar v0.1.4 src/customizer/draft-state.js
 * @see WordPress/wp-admin-sidebar v0.1.4 src/class-sidebar-rest.php
 */

import {
	ADMIN_SIDEBAR_LAYOUT_RECEIVE,
	ADMIN_SIDEBAR_LAYOUT_CLEAR,
} from 'calypso/state/action-types';
import 'calypso/state/admin-sidebar/layout/init';
import type { LayoutDelta } from './types';

export const receiveAdminSidebarLayout = ( siteId: number | string, delta: LayoutDelta ) =>
	( {
		type: ADMIN_SIDEBAR_LAYOUT_RECEIVE,
		siteId,
		delta,
	} ) as const;

export const clearAdminSidebarLayout = ( siteId: number | string ) =>
	( {
		type: ADMIN_SIDEBAR_LAYOUT_CLEAR,
		siteId,
	} ) as const;
