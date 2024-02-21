import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import useQueryKeysFactory from './lib/use-query-keys-factory';
import type { StoreProductSlug, Product, RawAPIProductsList } from '../types';

type ProductsIndex = {
	[ productSlug in StoreProductSlug ]?: Product;
};

/**
 * Fetches all products, transformed into a map of productSlug => Product (with camelCased props)
 * - Only properties needed by the UI are included (which can gradually be expanded as needed)
 * @returns Query result
 */
function useProducts(): UseQueryResult< ProductsIndex > {
	const queryKeys = useQueryKeysFactory();

	return useQuery( {
		queryKey: queryKeys.products(),
		queryFn: async (): Promise< ProductsIndex > => {
			const apiProducts: RawAPIProductsList = await wpcomRequest( {
				path: `/products`,
				apiVersion: '1.1',
			} );

			return Object.fromEntries(
				Object.keys( apiProducts ).map( ( productSlug ) => {
					const product = apiProducts[ productSlug ];

					return [
						productSlug,
						{
							id: Number( product.product_id ),
							name: product.product_name,
							term: product.product_term,
							description: product.description,
							productSlug: product.product_slug,
							costSmallestUnit: Number( product.cost_smallest_unit ),
							currencyCode: product.currency_code,
							priceTierList: product.price_tier_list?.map( ( priceTier ) => ( {
								minimumUnits: Number( priceTier.minimum_units ),
								maximumUnits: Number( priceTier.maximum_units ),
								minimumPrice: Number( priceTier.minimum_price ),
								maximumPrice: Number( priceTier.maximum_price ),
								minimumPriceDisplay: priceTier.minimum_price_display,
								maximumPriceDisplay: priceTier.maximum_price_display,
							} ) ),
						},
					];
				} )
			);
		},
	} );
}

export default useProducts;
