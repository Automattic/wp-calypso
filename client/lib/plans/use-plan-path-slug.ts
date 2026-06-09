import { plansQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

/**
 * Returns a getter that resolves a plan's product slug to its server-provided
 * `path_slug` — the short, human-readable URL alias used in checkout and plan
 * routes (e.g. `business` for the `business-bundle` product).
 *
 * Prefer this over the hardcoded `getPlanPath` / `getPathSlug` helpers from
 * `@automattic/calypso-products`, which duplicate this data client-side.
 *
 * Backed by the `/plans` query. `path_slug` comes from a manually-maintained
 * server list and may be absent for some plans, so the getter falls back to the
 * product slug itself (which checkout routes also accept). It likewise falls
 * back while plans are still loading or when the product slug is unknown.
 */
export function usePlanPathSlugGetter(): ( productSlug: string ) => string {
	const { data: plans } = useQuery( plansQuery() );

	return useCallback(
		( productSlug: string ) => {
			const plan = plans?.find( ( { product_slug } ) => product_slug === productSlug );
			return plan?.path_slug || productSlug;
		},
		[ plans ]
	);
}
