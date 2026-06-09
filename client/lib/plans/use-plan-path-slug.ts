import { plansQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

/**
 * Returns a getter that resolves a plan's product slug to its server-provided
 * `path_slug` — the short, human-readable URL alias used in checkout and plan
 * routes (e.g. `business` for the `business-bundle` product).
 *
 * Reads the server-provided `path_slug` from the plans query rather than the
 * hardcoded client-side plan data that `@automattic/calypso-products` used to
 * carry.
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

/**
 * Returns a getter that resolves a plan's `path_slug` (the URL alias, e.g.
 * `business`) back to its product slug (e.g. `business-bundle`) — the inverse of
 * `usePlanPathSlugGetter`. Useful for parsing a plan referenced by its path slug
 * in an inbound URL.
 *
 * If the value isn't a known path slug it is returned unchanged, so a product
 * slug (or an unknown value) passes through; the same happens while plans are
 * still loading.
 */
export function usePlanProductSlugFromPathGetter(): ( pathSlug: string ) => string {
	const { data: plans } = useQuery( plansQuery() );

	return useCallback(
		( pathSlug: string ) =>
			plans?.find( ( plan ) => plan.path_slug === pathSlug )?.product_slug ?? pathSlug,
		[ plans ]
	);
}
