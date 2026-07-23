import { useQueries, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { isFqdnQuery } from '../helpers';
import { useDomainSearch } from '../page/context';
import type { BundleSuggestion } from '@automattic/api-core';

export interface InlineBundleEntry {
	/**
	 * The bundle for the trigger domain: `undefined` while it is still being
	 * fetched, `null` when the backend has no bundle for it.
	 */
	bundle: BundleSuggestion | null | undefined;
	/**
	 * True while the per-FQDN bundle request is in flight.
	 */
	isLoading: boolean;
}

/**
 * Drives the inline bundle rows shown beneath trigger-domain suggestions.
 *
 * Inline bundles only apply to a bare-term search (no TLD in the query) and only
 * when the `domain-bundling` flag is on (surfaced as `config.showBundleSuggestions`).
 * When enabled it reads the cheap `bundle_triggers` catalogue list, then, for
 * every cart item whose TLD is a trigger, lazily fetches that FQDN's bundle from
 * the per-FQDN `/domains/bundle` (v2) endpoint. Each FQDN is fetched at most once
 * and cached. Consumers look up a domain's bundle via `getInlineBundle`.
 */
export const useInlineBundles = () => {
	const { query, queries, config, cart } = useDomainSearch();

	// An FQDN search keeps the top BundleCard path, so inline bundles are gated
	// to bare-term queries (see isFqdnQuery, shared with useSuggestionsList).
	const inlineBundlesEnabled = config.showBundleSuggestions && ! isFqdnQuery( query );

	const { data: bundleTriggers = [] } = useQuery( {
		...queries.bundleTriggers( query ),
		enabled: inlineBundlesEnabled,
	} );

	// A cart item whose TLD is a trigger offers an inline bundle. Keep the row for
	// an item that is either standalone or the primary of its own bundle: the
	// primary case is the trigger the user just bundled, whose row stays visible
	// and swaps its CTA to "Continue" (mirroring the top BundleCard). A domain
	// added only as a companion of some other bundle is excluded — it doesn't get
	// its own offer. Dedupe by FQDN so each domain is fetched once even if it
	// somehow appears twice in the cart.
	const triggerFqdns = useMemo( () => {
		if ( ! inlineBundlesEnabled || bundleTriggers.length === 0 ) {
			return [];
		}

		const seen = new Set< string >();

		return cart.items
			.filter(
				( item ) =>
					bundleTriggers.includes( item.tld ) && ( ! item.bundle || item.bundle.isPrimary )
			)
			.map( ( item ) => `${ item.domain }.${ item.tld }` )
			.filter( ( fqdn ) => {
				if ( seen.has( fqdn ) ) {
					return false;
				}

				seen.add( fqdn );
				return true;
			} );
	}, [ inlineBundlesEnabled, bundleTriggers, cart.items ] );

	const bundleResults = useQueries( {
		queries: triggerFqdns.map( ( fqdn ) => ( {
			...queries.bundleForDomain( fqdn ),
			enabled: inlineBundlesEnabled,
		} ) ),
	} );

	// Derived inline (not memoized): useQueries returns a fresh array each render,
	// so memoizing on it gains nothing and trips @tanstack/query's no-unstable-deps
	// rule. This mirrors the availability combinator in useSuggestionsList.
	const inlineBundles = new Map< string, InlineBundleEntry >();
	triggerFqdns.forEach( ( fqdn, index ) => {
		const result = bundleResults[ index ];
		inlineBundles.set( fqdn, {
			bundle: result?.data,
			isLoading: result?.isLoading ?? false,
		} );
	} );

	return {
		bundleTriggers,
		getInlineBundle: ( fqdn: string ): InlineBundleEntry | undefined => inlineBundles.get( fqdn ),
	};
};
