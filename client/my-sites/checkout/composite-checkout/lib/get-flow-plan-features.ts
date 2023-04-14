import { applyTestFiltersToPlansList, getPlan, isMonthly } from '@automattic/calypso-products';
import { ResponseCartProduct } from '@automattic/shopping-cart';
import { getPlanFeaturesObject } from 'calypso/lib/plans/features-list';
import {
	getHighlightedFeatures,
	getPlanFeatureAccessor,
} from 'calypso/my-sites/plan-features-comparison/util';

export default function getFlowPlanFeatures(
	flowName: string,
	product: ResponseCartProduct | undefined
) {
	const productSlug = product?.product_slug;

	if ( ! productSlug ) {
		return [];
	}

	const plan = getPlan( productSlug );

	if ( ! plan ) {
		return [];
	}

	const planConstantObj = applyTestFiltersToPlansList( plan, undefined );

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
	let featuresObject = getPlanFeaturesObject( featureAccessor() );

	if ( isMonthly( planConstantObj.getStoreSlug() ) ) {
		const annualOnlyFeatures = planConstantObj.getAnnualPlansOnlyFeatures?.() ?? [];

		if ( annualOnlyFeatures.length > 0 ) {
			featuresObject = featuresObject.filter( ( feature ) => {
				return ! annualOnlyFeatures.includes( feature.getSlug() );
			} );
		}
	}

	return featuresObject.map( ( feature ) => {
		return {
			...feature,
			isHighlightedFeature: highlightedFeatures.includes( feature.getSlug() ),
		};
	} );
}
