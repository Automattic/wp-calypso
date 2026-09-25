import { useQueries } from '@tanstack/react-query';
import { useDomainSearch } from '../../page/context';
import type { BundleSuggestion } from '@automattic/api-core';

const hasCompanion = ( bundle: BundleSuggestion | null | undefined ): bundle is BundleSuggestion =>
	!! bundle && bundle.domains.length > 1;

/**
 * The backend only anchors a bundle on a trigger TLD (`.com` today), and only
 * while that name is available, so a typed `.blog` or a taken `.com` has none of
 * its own. Each anchor is asked in order and the first with a companion wins;
 * a later answer never replaces an earlier anchor's, so the card does not swap.
 * Anchors share the `bundleForDomain` cache with the classic inline bundle rows.
 */
export const useNamePulseBundle = ( anchors: string[] | null ) => {
	const { queries, config } = useDomainSearch();
	const enabled = config.showBundleSuggestions && anchors !== null;

	const results = useQueries( {
		queries: ( enabled ? anchors : [] ).map( ( fqdn ) => ( {
			...queries.bundleForDomain( fqdn ),
			enabled: true,
		} ) ),
	} );

	if ( ! enabled ) {
		return { bundle: undefined, isLoading: config.showBundleSuggestions };
	}

	for ( const result of results ) {
		if ( result.isPending ) {
			return { bundle: undefined, isLoading: true };
		}

		if ( hasCompanion( result.data ) ) {
			return { bundle: result.data, isLoading: false };
		}
	}

	return { bundle: undefined, isLoading: false };
};
