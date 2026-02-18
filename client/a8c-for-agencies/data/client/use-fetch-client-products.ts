import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { selectAlphabeticallySortedProductOptions } from 'calypso/jetpack-cloud/sections/partner-portal/lib';
import wpcom from 'calypso/lib/wp';
import type {
	APIProductFamily,
	APIProductFamilyProduct,
} from 'calypso/a8c-for-agencies/types/products';

function queryClientProducts(): Promise< APIProductFamily[] > {
	return wpcom.req
		.get( {
			apiNamespace: 'wpcom/v2',
			path: '/agency-client/public/products',
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
								alternative_product_id:
									product.alternative_product_id ||
									product.monthly_alternative_product_id ||
									product.yearly_alternative_product_id,
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
