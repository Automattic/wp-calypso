import { JETPACK_SOCIAL_PRODUCTS } from '@automattic/calypso-products';
import { useMemo } from 'react';
import { useSelector } from 'calypso/state';
import { getSitePlan } from 'calypso/state/sites/selectors';
import { getPlansToDisplay, getProductsToDisplay } from '../../product-grid/utils';
import useGetPlansGridProducts from '../../use-get-plans-grid-products';
import useIsOnSale from '../../use-is-on-sale';
import { ProductSlugsProps } from '../types';

const useProductSlugs = ( { siteId, duration }: ProductSlugsProps ): string[] => {
	const currentPlan = useSelector( ( state ) => getSitePlan( state, siteId ) );
	const currentPlanSlug = currentPlan?.product_slug || null;
	const { availableProducts, purchasedProducts, includedInPlanProducts } =
		useGetPlansGridProducts( siteId );
	const isOnSale = useIsOnSale();

	return useMemo(
		() =>
			[
				...getProductsToDisplay( {
					duration,
					availableProducts,
					purchasedProducts,
					includedInPlanProducts,
				} ),
				...getPlansToDisplay( { duration, currentPlanSlug, isOnSale } ),
			]
				.map( ( { productSlug } ) => productSlug )
				// TO-DO: Once Jetpack Social pricing tiers and the introductory discount have been worked on, filtering should be removed.
				.filter(
					( productSlug ) =>
						! ( JETPACK_SOCIAL_PRODUCTS as ReadonlyArray< string > ).includes( productSlug )
				),
		[
			duration,
			availableProducts,
			purchasedProducts,
			includedInPlanProducts,
			currentPlanSlug,
			isOnSale,
		]
	);
};

export default useProductSlugs;
