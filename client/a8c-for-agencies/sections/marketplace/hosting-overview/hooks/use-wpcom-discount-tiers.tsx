import { useMemo } from 'react';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import wpcomBulkOptions from '../../lib/wpcom-bulk-options';
import type { APIProductFamily } from 'calypso/a8c-for-agencies/types/products';

export default function useWPCOMDiscountTiers() {
	const { data: products } = useProductsQuery( true );

	const wpcomProducts = products
		? ( products.find(
				( product ) => product.slug === 'wpcom-hosting'
		  ) as unknown as APIProductFamily )
		: undefined;

	return useMemo( () => {
		return wpcomBulkOptions( wpcomProducts?.discounts?.tiers ?? [] );
	}, [ wpcomProducts?.discounts?.tiers ] );
}
