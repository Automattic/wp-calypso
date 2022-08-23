import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import IntroPricingBanner from 'calypso/components/jetpack/intro-pricing-banner';
import StoreFooter from 'calypso/jetpack-connect/store-footer';
import { getSitePlan } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getPlansToDisplay, getProductsToDisplay } from '../product-grid/utils';
import useGetPlansGridProducts from '../use-get-plans-grid-products';
import { JetpackFree } from './jetpack-free';
import { Recommendations } from './recommendations';
import { UserLicensesDialog } from './user-licenses-dialog';
import type { ProductStoreProps } from './types';

import './style.scss';

const ProductStore: React.FC< ProductStoreProps > = ( {
	enableUserLicensesDialog,
	urlQueryArgs,
	duration,
} ) => {
	const siteId = useSelector( getSelectedSiteId );
	const currentPlan = useSelector( ( state ) => getSitePlan( state, siteId ) );
	const currentPlanSlug = currentPlan?.product_slug || null;
	const { availableProducts, purchasedProducts, includedInPlanProducts } =
		useGetPlansGridProducts( siteId );

	const allItems = useMemo(
		() => [
			...getProductsToDisplay( {
				duration,
				availableProducts,
				purchasedProducts,
				includedInPlanProducts,
			} ),
			...getPlansToDisplay( { duration, currentPlanSlug } ),
		],
		[ duration, availableProducts, purchasedProducts, includedInPlanProducts, currentPlanSlug ]
	);

	return (
		<div className="jetpack-product-store">
			{ enableUserLicensesDialog && <UserLicensesDialog siteId={ siteId } /> }

			<div className="jetpack-product-store__pricing-banner">
				<IntroPricingBanner
					productSlugs={ allItems.map( ( { productSlug } ) => productSlug ) }
					siteId={ siteId ?? 'none' }
				/>
			</div>

			<JetpackFree urlQueryArgs={ urlQueryArgs } siteId={ siteId } />

			<Recommendations />

			<StoreFooter />
		</div>
	);
};

export default ProductStore;
