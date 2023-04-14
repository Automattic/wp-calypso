import { getPlan } from '@automattic/calypso-products';
import { ResponseCartProduct } from '@automattic/shopping-cart';
import { getPlanFeaturesObject } from 'calypso/lib/plans/features-list';
import {
	getHighlightedFeatures,
	getPlanFeatureAccessor,
} from 'calypso/my-sites/plan-features-comparison/util';

export default function getFlowPlanFeatures(
	flowName: string,
	plan: ResponseCartProduct | undefined
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
	return getPlanFeaturesObject( featureAccessor ).map( ( feature ) => {
		return {
			...feature,
			isHighlightedFeature: highlightedFeatures.includes( feature.getSlug() ),
		};
	} );
}
