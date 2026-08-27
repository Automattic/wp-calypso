import { fetchAgencyProducts, fetchAgencyTermProducts } from '@automattic/api-core';
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

export const agencyTermProductsQuery = ( agencyId: number ) =>
	queryOptions( {
		queryKey: [ 'agency', agencyId, 'term-products' ] as const,
		queryFn: async () => flattenFamilies( await fetchAgencyTermProducts( agencyId ) ),
		enabled: !! agencyId,
		staleTime: 5 * 60 * 1000,
	} );
