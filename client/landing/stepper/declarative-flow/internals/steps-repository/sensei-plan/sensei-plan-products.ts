import { ProductsList } from '@automattic/data-stores';
import { TIMELESS_PLAN_BUSINESS } from '@automattic/data-stores/src/plans';
import { useLocale } from '@automattic/i18n-utils';
import { useSelect } from '@wordpress/data';
import { useSupportedPlans } from 'calypso/../packages/plans-grid/src/hooks';
import { PLANS_STORE } from 'calypso/landing/stepper/stores';
import type { PlanBillingPeriod, PlansSelect } from '@automattic/data-stores';

const SENSEI_PRO_PRODUCT_YEARLY = 'sensei_pro_yearly';
const SENSEI_PRO_PRODUCT_MONTHLY = 'sensei_pro_monthly';

export function useSenseiProPricing( billingPeriod: PlanBillingPeriod ) {
	return useSelect(
		( select ) => {
			const isYearly = billingPeriod === 'ANNUALLY';
			const { getProductBySlug } = select( ProductsList.store );
			const yearly = getProductBySlug( SENSEI_PRO_PRODUCT_YEARLY );
			const monthly = getProductBySlug( SENSEI_PRO_PRODUCT_MONTHLY );

			if ( ! yearly || ! monthly ) {
				return {
					monthlyPrice: 0,
					yearlyPrice: 0,
					price: 0,
					productSlug: '',
					currencyCode: '',
				};
			}

			return {
				monthlyPrice: monthly.cost,
				yearlyPrice: yearly.cost,
				price: isYearly ? Math.ceil( yearly.cost / 12 ) : monthly.cost,
				productSlug: isYearly ? yearly.product_slug : monthly.product_slug,
				currencyCode: yearly.currency_code,
			};
		},
		[ billingPeriod ]
	);
}

export function useBusinessPlanPricing( billingPeriod: PlanBillingPeriod ) {
	const locale = useLocale();
	const { supportedPlans } = useSupportedPlans( locale, billingPeriod );

	const businessPlan = supportedPlans.find( ( plan ) => {
		return plan && TIMELESS_PLAN_BUSINESS === plan.periodAgnosticSlug;
	} );

	const slug = businessPlan?.periodAgnosticSlug;

	return useSelect(
		( select ) => {
			const { getPlanProduct }: PlansSelect = select( PLANS_STORE );
			const monthly = getPlanProduct( slug, 'MONTHLY' );
			const yearly = getPlanProduct( slug, 'ANNUALLY' );

			const isYearly = billingPeriod === 'ANNUALLY';

			if ( ! yearly || ! monthly ) {
				return {
					monthlyPrice: 0,
					yearlyPrice: 0,
					price: 0,
					productSlug: '',
				};
			}

			return {
				monthlyPrice: monthly.rawPrice,
				yearlyPrice: yearly.rawPrice,
				price: isYearly ? Math.ceil( yearly.rawPrice / 12 ) : monthly.rawPrice,
				productSlug: isYearly ? yearly.storeSlug : monthly.storeSlug,
			};
		},
		[ billingPeriod, slug ]
	);
}
