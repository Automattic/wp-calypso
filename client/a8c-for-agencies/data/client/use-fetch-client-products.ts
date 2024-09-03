import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { selectAlphabeticallySortedProductOptions } from 'calypso/jetpack-cloud/sections/partner-portal/lib';
import wpcom from 'calypso/lib/wp';
import { APIProductFamily, APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

function queryClientProducts(): Promise< APIProductFamily[] > {
	return wpcom.req
		.get( {
			apiNamespace: 'wpcom/v2',
			path: '/agency-client/public/pricing',
		} )
		.then( ( data: APIProductFamily[] ) => {
			const exclude = [
				'free',
				'personal',
				'premium',
				'professional',
				'jetpack-backup-daily',
				'jetpack-backup-realtime',
				'jetpack-backup-t0',
				'jetpack-security-daily',
				'jetpack-security-realtime',
			];

			return data
				.map( ( family ) => {
					return {
						...family,
						products: family.products
							.filter( ( product ) => {
								return exclude.indexOf( product.slug ) === -1;
							} )
							.map( ( product ) => ( {
								...product,
								family_slug: family.slug,
							} ) ),
					};
				} )
				.filter( ( family ) => {
					return family.products.length > 0;
				} );
		} );
}

export default function useFetchClientProducts(
	isEnabled = true
): UseQueryResult< APIProductFamilyProduct[], unknown > {
	return useQuery( {
		queryKey: [ 'a4a-client-products' ],
		queryFn: queryClientProducts,
		select: selectAlphabeticallySortedProductOptions,
		refetchOnWindowFocus: false,
		enabled: isEnabled,
	} );
}
