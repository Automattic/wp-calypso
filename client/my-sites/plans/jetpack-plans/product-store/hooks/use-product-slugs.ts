import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getSitePlan } from 'calypso/state/sites/selectors';
import { getPlansToDisplay, getProductsToDisplay } from '../../product-grid/utils';
import { Duration } from '../../types';
import useGetPlansGridProducts from '../../use-get-plans-grid-products';

const useProductSlugs = ( siteId: number | null, duration: Duration ): string[] => {
	const currentPlan = useSelector( ( state ) => getSitePlan( state, siteId ) );
	const currentPlanSlug = currentPlan?.product_slug || null;
	const { availableProducts, purchasedProducts, includedInPlanProducts } =
		useGetPlansGridProducts( siteId );

	return useMemo(
		() =>
			[
				...getProductsToDisplay( {
					duration,
					availableProducts,
					purchasedProducts,
					includedInPlanProducts,
				} ),
				...getPlansToDisplay( { duration, currentPlanSlug } ),
			].map( ( { productSlug } ) => productSlug ),
		[ duration, availableProducts, purchasedProducts, includedInPlanProducts, currentPlanSlug ]
	);
};

export default useProductSlugs;
