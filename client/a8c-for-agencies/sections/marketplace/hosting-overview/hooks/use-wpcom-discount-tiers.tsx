import { useMemo } from 'react';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import { APIProductFamily } from 'calypso/state/partner-portal/types';
import wpcomBulkOptions from '../../lib/wpcom-bulk-options';

export default function useWPCOMDiscountTiers() {
	const { data: products } = useProductsQuery( false, true );

	const wpcomProducts = products
		? ( products.find(
				( product ) => product.slug === 'wpcom-hosting'
		  ) as unknown as APIProductFamily )
		: undefined;

	return useMemo( () => {
		return wpcomBulkOptions( wpcomProducts?.discounts?.tiers ?? [] );
	}, [ wpcomProducts?.discounts?.tiers ] );
}
