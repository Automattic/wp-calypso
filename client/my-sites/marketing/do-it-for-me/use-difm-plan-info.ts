import {
	PLAN_PREMIUM,
	WPCOM_DIFM_LITE,
	PLAN_BUSINESS,
	getPlan,
	getDIFMTieredPriceDetails,
	isPremium,
	isBusiness,
	isEcommerce,
	isPro,
	getFeatureByKey,
} from '@automattic/calypso-products';
import { formatCurrency } from '@automattic/number-formatters';
import { useQueryProductsList } from 'calypso/components/data/query-products-list';
import { useSelector } from 'calypso/state';
import {
	getProductBySlug,
	getProductCost,
	getProductCurrencyCode,
} from 'calypso/state/products-list/selectors';
import { getSitePlan } from 'calypso/state/sites/selectors';

const hasHigherPlan = ( currentPlan: string, plan: typeof PLAN_PREMIUM | typeof PLAN_BUSINESS ) => {
	const planMatchers =
		plan === PLAN_PREMIUM
			? [ isPremium, isBusiness, isEcommerce, isPro ]
			: [ isBusiness, isEcommerce, isPro ];

	return planMatchers.some( ( planMatcher ) =>
		planMatcher( {
			productSlug: currentPlan,
		} )
	);
};

export const useDIFMPlanInfo = ( {
	isStoreFlow,
	siteId,
}: {
	isStoreFlow: boolean;
	siteId?: number;
} ) => {
	const currencyCode = useSelector( ( state ) => getProductCurrencyCode( state, WPCOM_DIFM_LITE ) );

	useQueryProductsList( {
		type: 'partial',
		productSlugList: [ PLAN_PREMIUM, WPCOM_DIFM_LITE, PLAN_BUSINESS ],
		currency: currencyCode ?? undefined,
		persist: true,
	} );

	const product = useSelector( ( state ) => getProductBySlug( state, WPCOM_DIFM_LITE ) );
	const productCost = product?.cost;

	const planSlug = isStoreFlow ? PLAN_BUSINESS : PLAN_PREMIUM;
	const planObject = getPlan( planSlug );
	const planTitle = planObject?.getTitle();
	const planCostInteger = useSelector( ( state ) => getProductCost( state, planSlug ) );

	const difmTieredPriceDetails = getDIFMTieredPriceDetails( product );
	const extraPageCost = difmTieredPriceDetails?.perExtraPagePrice;

	// This is used in a FAQ item.
	const businessPlanCostInteger = useSelector( ( state ) =>
		getProductCost( state, PLAN_BUSINESS )
	);

	const hasPriceDataLoaded =
		productCost && extraPageCost && planCostInteger && businessPlanCostInteger && currencyCode;

	const displayCost = hasPriceDataLoaded
		? formatCurrency( productCost, currencyCode, { stripZeros: true } )
		: '';

	const planCost = hasPriceDataLoaded
		? formatCurrency( planCostInteger, currencyCode, { stripZeros: true } )
		: '';

	const currentPlan = useSelector( ( state ) => ( siteId ? getSitePlan( state, siteId ) : null ) );
	const hasCurrentPlanOrHigherPlan = currentPlan?.product_slug
		? hasHigherPlan( currentPlan.product_slug, planSlug )
		: false;

	const planStorageString = planObject?.getStorageFeature?.()
		? getFeatureByKey( planObject.getStorageFeature() )?.getTitle()
		: '';

	const extraPageDisplayCost = hasPriceDataLoaded
		? formatCurrency( extraPageCost, currencyCode, {
				stripZeros: true,
				isSmallestUnit: true,
		  } )
		: '';

	const businessPlanCost = hasPriceDataLoaded
		? formatCurrency( businessPlanCostInteger, currencyCode, { stripZeros: true } )
		: '';

	return {
		planTitle,
		planCostInteger,
		extraPageCost,
		businessPlanCostInteger,
		currencyCode,
		displayCost,
		hasPriceDataLoaded,
		hasCurrentPlanOrHigherPlan,
		planSlug,
		planStorageString,
		planCost,
		extraPageDisplayCost,
		businessPlanCost,
	};
};
