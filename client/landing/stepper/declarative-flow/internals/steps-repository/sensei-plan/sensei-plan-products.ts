import { useLocale } from '@automattic/i18n-utils';
import { useSelect } from '@wordpress/data';
import { useSupportedPlans } from 'calypso/../packages/plans-grid/src/hooks';
import { PLANS_STORE } from 'calypso/landing/gutenboarding/stores/plans';
import { PRODUCTS_LIST_STORE } from 'calypso/landing/stepper/stores';
import type { PlanBillingPeriod } from 'calypso/../packages/data-stores';

const SENSEI_PRO_PRODUCT_YEARLY = 'sensei_pro_yearly';
const SENSEI_PRO_PRODUCT_MONTHLY = 'sensei_pro_monthly';

export function useSenseiProPricing( billingPeriod: PlanBillingPeriod ) {
	const isYearly = billingPeriod === 'ANNUALLY';

	return useSelect(
		( select ) => {
			const yearly = select( PRODUCTS_LIST_STORE ).getProductBySlug( SENSEI_PRO_PRODUCT_YEARLY );
			const monthly = select( PRODUCTS_LIST_STORE ).getProductBySlug( SENSEI_PRO_PRODUCT_MONTHLY );

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
		[ isYearly ]
	);
}

export function useBusinessPlanPricing( billingPeriod: 'MONTHLY' | 'ANNUALLY' ) {
	const isYearly = billingPeriod === 'ANNUALLY';
	const locale = useLocale();
	const { supportedPlans } = useSupportedPlans( locale, billingPeriod );

	const businessPlan = supportedPlans.find( ( plan ) => {
		return plan && 'business' === plan.periodAgnosticSlug;
	} );

	const slug = businessPlan?.periodAgnosticSlug;

	const businessPlanProduct = useSelect(
		( select ) => select( PLANS_STORE ).getPlanProduct( slug, billingPeriod ),
		[ slug, billingPeriod ]
	);

	const businessPlanPricing = useSelect(
		( select ) => {
			const monthly = select( PLANS_STORE ).getPlanProduct( slug, 'MONTHLY' );
			const yearly = select( PLANS_STORE ).getPlanProduct( slug, 'ANNUALLY' );
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
				productSlug: '',
			};
		},
		[ isYearly, slug ]
	);

	return { businessPlanPricing, businessPlanProduct };
}
