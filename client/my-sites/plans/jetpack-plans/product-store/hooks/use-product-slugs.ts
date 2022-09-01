import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getSitePlan } from 'calypso/state/sites/selectors';
import { getPlansToDisplay, getProductsToDisplay } from '../../product-grid/utils';
import useGetPlansGridProducts from '../../use-get-plans-grid-products';
import { ProductSlugsProps } from '../types';

const useProductSlugs = ( { siteId, duration }: ProductSlugsProps ): string[] => {
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
