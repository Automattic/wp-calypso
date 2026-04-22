/**
 * DashboardBridge — embeds the new dashboard purchase-settings (and cancel)
 * flow inside the classic Calypso shell without a cross-domain redirect.
 *
 * Architecture overview
 * ─────────────────────
 * The dashboard components (client/dashboard/me/billing-purchases/) are built
 * on TanStack Router + TanStack Query. Classic Calypso uses page.js + Redux.
 *
 * The bridge solves the incompatibility by:
 *  1. Spinning up an in-memory TanStack Router that mirrors the dashboard's
 *     route tree (same path → same route IDs → hooks like useParams() work).
 *  2. Providing the AuthContext the dashboard expects, sourced from the Redux
 *     store instead of a fresh API fetch (user is already loaded).
 *  3. Forwarding analytics to Calypso's recordTracksEvent.
 *  4. Using the dashboard's shared queryClient so all API queries are cache-
 *     coherent with the rest of the dashboard ecosystem.
 *  5. Setting isBackport: true so the dashboard Root skips its own masthead /
 *     sidebar (the classic Calypso shell provides those).
 *
 * What this does NOT do (yet — see TODO comments):
 *  - Sync the browser URL when navigating within the bridge (memory router).
 *  - Render the dashboard Snackbars (notices are handled by classic Calypso).
 */

import { queryClient } from '@automattic/api-queries';
import { QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, RouterProvider } from '@tanstack/react-router';
import { useMemo } from 'react';
import { AnalyticsProvider } from 'calypso/dashboard/app/analytics';
import { AuthContext } from 'calypso/dashboard/app/auth';
import { AppProvider, APP_CONTEXT_DEFAULT_CONFIG } from 'calypso/dashboard/app/context';
import { getRouter } from 'calypso/dashboard/app/router';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import type { AnalyticsClient } from 'calypso/dashboard/app/analytics';
import type { AppConfig } from 'calypso/dashboard/app/context';

// ─── Bridge AppConfig ─────────────────────────────────────────────────────────

/**
 * Minimal config for the bridge.
 *
 * Key decisions:
 *  - optIn: false  → rootRoute.beforeLoad skips the opt-in preference check
 *                    (the user is already in classic Calypso; no redirect needed)
 *  - isBackport: true → Root renders only <Outlet />, no dashboard chrome
 *  - supports.me   → enables the billing/purchase route sub-tree
 *  - everything else false → keeps the bundle small; unneeded route code is
 *                            never loaded
 */
const BRIDGE_APP_CONFIG: AppConfig = {
	...APP_CONTEXT_DEFAULT_CONFIG,
	name: 'calypso-bridge',
	basePath: '/',
	mainRoute: '/me/billing/purchases',
	optIn: false,
	isBackport: true,
	supports: {
		...APP_CONTEXT_DEFAULT_CONFIG.supports,
		me: {
			billing: {
				monetizeSubscriptions: false,
			},
			security: {
				sshKey: false,
			},
			apps: false,
		},
	},
};

// ─── Analytics shim ───────────────────────────────────────────────────────────

/**
 * Forward dashboard analytics calls to Calypso's own Tracks implementation.
 * Page views are intentionally a no-op — classic Calypso already tracks them.
 */
const analyticsClient: AnalyticsClient = {
	recordTracksEvent( event, properties ) {
		recordTracksEvent( event, properties );
	},
	recordPageView() {
		// no-op: handled by classic Calypso's PageViewTracker
	},
};

// ─── Component ────────────────────────────────────────────────────────────────

interface DashboardBridgeProps {
	purchaseId: number;
	/**
	 * Which sub-route to start on. Defaults to the purchase-settings page.
	 * Pass 'cancel' when the classic cancel route (/me/purchases/:site/:id/cancel)
	 * is entered directly — Phase 2 will wire that up.
	 */
	initialRoute?: 'settings' | 'cancel';
}

export function DashboardBridge( { purchaseId, initialRoute = 'settings' }: DashboardBridgeProps ) {
	// ── Auth bridge ────────────────────────────────────────────────────────
	// Classic Calypso bootstraps the user server-side into Redux. The dashboard
	// User type is identical to Calypso's UserData (both alias @automattic/api-core
	// User), so we can pass it directly without any field mapping.
	const calypsoUser = useSelector( getCurrentUser );

	const authContextValue = useMemo( () => {
		if ( ! calypsoUser ) {
			return undefined;
		}
		return {
			user: calypsoUser,
			logout: async () => {
				// Delegate to the classic Calypso logout URL.
				window.location.href = calypsoUser.logout_URL || '/log-out';
			},
		};
	}, [ calypsoUser ] );

	// ── Memory router ──────────────────────────────────────────────────────
	// createMemoryHistory keeps routing in-memory so the browser URL stays at
	// the classic Calypso path (/me/purchases/:site/:id).
	//
	// The path must match the dashboard route tree exactly so that route IDs
	// (used by purchaseSettingsRoute.useParams(), cancelPurchaseRoute.useParams())
	// resolve correctly.
	//
	// TODO: sync the memory router's location back to the browser URL via
	// page.replace() on each router.subscribe('onResolved') so cancel-flow
	// sub-pages become deep-linkable.
	const router = useMemo( () => {
		const path =
			initialRoute === 'cancel'
				? `/me/billing/purchases/${ purchaseId }/cancel`
				: `/me/billing/purchases/${ purchaseId }/`;

		const memoryHistory = createMemoryHistory( {
			initialEntries: [ path ],
		} );

		return getRouter( BRIDGE_APP_CONFIG, memoryHistory );
	}, [ purchaseId, initialRoute ] );

	// User must always be loaded in classic Calypso (server-bootstrapped).
	// Guard here just in case the selector fires before hydration completes.
	if ( ! authContextValue ) {
		return null;
	}

	return (
		<AppProvider config={ BRIDGE_APP_CONFIG }>
			{ /* Use the dashboard's shared queryClient so purchase queries are cache-
			     coherent with the dashboard. The outer classic Calypso
			     QueryClientProvider (index.web.js) is shadowed here; its own cache
			     continues to serve classic components outside this tree. */ }
			<QueryClientProvider client={ queryClient }>
				{ /* Provide auth context from Redux instead of the dashboard's own
				     AuthProvider (which would re-fetch the user). The types are
				     identical so no field mapping is needed. */ }
				<AuthContext.Provider value={ authContextValue }>
					<AnalyticsProvider client={ analyticsClient }>
						<RouterProvider router={ router } />
					</AnalyticsProvider>
				</AuthContext.Provider>
			</QueryClientProvider>
		</AppProvider>
	);
}
