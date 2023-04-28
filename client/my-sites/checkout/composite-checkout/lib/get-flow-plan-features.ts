import { getPlan } from '@automattic/calypso-products';
import { ResponseCartProduct } from '@automattic/shopping-cart';
import { getPlanFeaturesObject } from 'calypso/lib/plans/features-list';
import {
	getHighlightedFeatures,
	getPlanFeatureAccessor,
} from 'calypso/my-sites/plan-features-comparison/util';

export default function getFlowPlanFeatures(
	flowName: string,
	plan: ResponseCartProduct | undefined,
	hasDomainsInCart: boolean,
	hasRenewalInCart: boolean,
	nextDomainIsFree: boolean
) {
	const productSlug = plan?.product_slug;

	if ( ! productSlug ) {
		return [];
	}

	const planConstantObj = getPlan( productSlug );

	if ( ! planConstantObj ) {
		return [];
	}

	const featureAccessor = getPlanFeatureAccessor( {
		flowName,
		plan: planConstantObj,
		isInVerticalScrollingPlansExperiment: false,
	} );

	if ( ! featureAccessor ) {
		return [];
	}

	const highlightedFeatures = getHighlightedFeatures( flowName, planConstantObj );
	const showFreeDomainFeature = ! hasDomainsInCart && ! hasRenewalInCart && nextDomainIsFree;
	return getPlanFeaturesObject( featureAccessor() )
		.filter( ( feature ) => {
			return showFreeDomainFeature || feature.getSlug() !== FEATURE_CUSTOM_DOMAIN;
		} )
		.map( ( feature ) => {
			return {
				...feature,
				isHighlightedFeature: highlightedFeatures.includes( feature.getSlug() ),
			};
		} );
}
