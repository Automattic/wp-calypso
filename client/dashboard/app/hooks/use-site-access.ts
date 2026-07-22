import { useSuspenseQuery } from '@tanstack/react-query';
import { useAppContext } from '../context';
import type { GateableSiteFeature } from '../context';
import type { QueryKey } from '@tanstack/react-query';

type VariantAccessQuery = {
	queryKey: QueryKey;
	queryFn: () => Promise< boolean >;
};

const NOOP_QUERY: VariantAccessQuery = {
	queryKey: [ 'variant-access-noop' ],
	queryFn: async () => true,
};

// `undefined` when the variant doesn't provide the query — callers should
// fall back to the default (capability or plan-based) check. A boolean is
// the variant's verdict.
function useVariantAccess( query: VariantAccessQuery | undefined ): boolean | undefined {
	const { data } = useSuspenseQuery( query ?? NOOP_QUERY );
	return query ? data : undefined;
}

/**
 * The variant's verdict on whether the current user can access a site.
 */
export function useSiteAccess( siteSlug: string ): boolean | undefined {
	const { queries } = useAppContext();
	return useVariantAccess( queries.siteAccessQuery?.( siteSlug ) );
}

/**
 * The variant's verdict on whether a site can use a feature.
 */
export function useSiteFeatureAccess(
	siteSlug: string,
	feature: GateableSiteFeature
): boolean | undefined {
	const { queries } = useAppContext();
	return useVariantAccess( queries.siteFeatureAccessQuery?.( siteSlug, feature ) );
}
