import { fetchAgencyProducts } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import type { AgencyProduct, AgencyProductFamily } from '@automattic/api-core';

function flattenFamilies( families: AgencyProductFamily[] ): AgencyProduct[] {
	return families.flatMap( ( family ) =>
		family.products.map( ( product ) => ( { ...product, family_slug: family.slug } ) )
	);
}

export const agencyProductsQuery = ( agencyId: number ) =>
	queryOptions( {
		queryKey: [ 'agency', agencyId, 'products' ] as const,
		queryFn: async () => flattenFamilies( await fetchAgencyProducts( agencyId ) ),
		enabled: !! agencyId,
		staleTime: 5 * 60 * 1000,
	} );

// A purchase can change the listed prices, e.g. by ending a promotion the
// agency was eligible for.
export function invalidateAgencyProducts( agencyId: number | undefined ) {
	queryClient.invalidateQueries( { queryKey: [ 'agency', agencyId, 'products' ] } );
}
