/**
 * External dependencies
 */
import React, { ReactNode, useCallback } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import RenderSwitch from 'calypso/components/jetpack/render-switch';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getSiteProducts, getSitePlan } from 'calypso/state/sites/selectors';
import { getPlan } from 'calypso/lib/plans';
import QuerySiteProducts from 'calypso/components/data/query-site-products';
import QuerySitePlans from 'calypso/components/data/query-site-plans';

type ExpiredSwitchProps = {
	mainView: ReactNode;
	expiredView: ReactNode;
	productSlugs: string[];
};

export default function ExpiredSwitch( {
	mainView,
	expiredView,
	productSlugs,
}: ExpiredSwitchProps ): ReactNode {
	const siteId = useSelector( getSelectedSiteId );
	const siteProducts = useSelector( ( state ) => getSiteProducts( state, siteId ) );
	const sitePlan = useSelector( ( state ) => getSitePlan( state, siteId, true ) );

	// Returns true if still loading product data.
	const isLoading = useCallback( () => {
		return ! siteProducts || ! sitePlan;
	}, [ siteProducts, sitePlan ] );

	// True if there's a product that's expired that has the products we care about.
	const hasOverlappingExpiredProduct = useCallback( () => {
		if ( ! siteProducts && ! sitePlan ) {
			return false;
		}
		let expiredProductSlugs: string[] = [];
		if ( siteProducts ) {
			expiredProductSlugs = siteProducts
				.filter( ( { expired } ) => expired )
				.map( ( { productSlug } ) => productSlug );
		}
		if ( sitePlan && sitePlan.expired ) {
			const sitePlanDetails = getPlan( sitePlan.product_slug );
			expiredProductSlugs = [
				...expiredProductSlugs,
				...sitePlanDetails.getHiddenFeatures(),
				...sitePlanDetails.getInferiorHiddenFeatures(),
			];
		}
		return expiredProductSlugs.some( ( product ) => productSlugs.includes( product ) );
	}, [ siteProducts, sitePlan, productSlugs ] );

	return (
		<RenderSwitch
			loadingCondition={ isLoading }
			renderCondition={ hasOverlappingExpiredProduct }
			trueComponent={ expiredView }
			falseComponent={ mainView }
			queryComponent={
				<>
					<QuerySiteProducts siteId={ siteId } />
					<QuerySitePlans siteId={ siteId } />
				</>
			}
		/>
	);
}
