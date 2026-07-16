import { fetchAgencyProducts } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';
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
