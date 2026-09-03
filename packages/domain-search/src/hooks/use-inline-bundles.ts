import { useQueries, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
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
 * Inline bundles apply whenever the `domain-bundling` flag is on (surfaced as
 * `config.showBundleSuggestions`), for both bare-term and FQDN queries:
 * selecting a trigger domain (e.g. `flowers.com`) should offer its bundle even
 * when the user typed a full domain. When enabled it reads the cheap
 * `bundle_triggers` catalogue list, then, for every cart item whose TLD is a
 * trigger, lazily fetches that FQDN's bundle from the per-FQDN `/domains/bundle`
 * (v2) endpoint. Each FQDN is fetched at most once and cached. Consumers look up
 * a domain's bundle via `getInlineBundle`.
 */
export const useInlineBundles = () => {
	const { query, queries, config, cart } = useDomainSearch();

	// Gated on the domain-bundling flag only. An FQDN query is included: its
	// bundleTriggers request shares a query key with useSuggestionsList's
	// bundleSuggestion (see api-queries domains.ts), so the two dedupe to one
	// network request rather than duplicating the same URL.
	const inlineBundlesEnabled = config.showBundleSuggestions;

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
