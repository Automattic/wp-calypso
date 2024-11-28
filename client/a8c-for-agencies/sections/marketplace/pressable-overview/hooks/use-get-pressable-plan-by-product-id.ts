import { useMemo } from 'react';
import useProductAndPlans from 'calypso/a8c-for-agencies/sections/marketplace/hooks/use-product-and-plans';

type Props = {
	product_id: number;
};

export default function useGetPressablePlanByProductId( { product_id }: Props ) {
	const { pressablePlans } = useProductAndPlans( {
		selectedSite: null,
		productSearchQuery: '',
	} );

	return useMemo( () => {
		return pressablePlans.find( ( plan ) => plan.product_id === product_id ) ?? null;
	}, [ pressablePlans, product_id ] );
}
