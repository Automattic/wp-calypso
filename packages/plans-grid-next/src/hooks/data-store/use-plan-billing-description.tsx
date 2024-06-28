import {
	isWpComFreePlan,
	isWpcomEnterpriseGridPlan,
	PLAN_BIENNIAL_PERIOD,
	PLAN_ANNUAL_PERIOD,
	PLAN_TRIENNIAL_PERIOD,
	PlanSlug,
	getPlanSlugForTermVariant,
	TERM_ANNUALLY,
	PLAN_HOSTING_TRIAL_MONTHLY,
} from '@automattic/calypso-products';
import { AddOns, Plans } from '@automattic/data-stores';
import { formatCurrency } from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import type { GridPlan } from '../../types';

interface UsePlanBillingDescriptionProps {
	siteId?: number | null;
	planSlug: PlanSlug;
	pricing: GridPlan[ 'pricing' ] | null;
	isMonthlyPlan?: boolean;
	storageAddOnsForPlan: ( AddOns.AddOnMeta | null )[] | null;
	coupon?: string;
	planUpgradeCreditsApplicable?: number | null;
	useCheckPlanAvailabilityForPurchase: Plans.UseCheckPlanAvailabilityForPurchase;
}

export default function usePlanBillingDescription( {
	siteId,
	planSlug,
	pricing,
	storageAddOnsForPlan,
	isMonthlyPlan,
	coupon,
	planUpgradeCreditsApplicable,
	useCheckPlanAvailabilityForPurchase,
}: UsePlanBillingDescriptionProps ) {
	const translate = useTranslate();
	const { currencyCode, originalPrice, discountedPrice, billingPeriod, introOffer } = pricing || {};

	const yearlyVariantPlanSlug = getPlanSlugForTermVariant( planSlug, TERM_ANNUALLY );

	const yearlyVariantPricing = Plans.usePricingMetaForGridPlans( {
		planSlugs: yearlyVariantPlanSlug ? [ yearlyVariantPlanSlug ] : [],
		storageAddOns: storageAddOnsForPlan,
		coupon,
		siteId,
		useCheckPlanAvailabilityForPurchase,
	} )?.[ yearlyVariantPlanSlug ?? '' ];

	if ( ! pricing ) {
		return null;
	}

	if (
		isWpComFreePlan( planSlug ) ||
		isWpcomEnterpriseGridPlan( planSlug ) ||
		planSlug === PLAN_HOSTING_TRIAL_MONTHLY
	) {
		return null;
	}

	if (
		isMonthlyPlan &&
		originalPrice?.monthly &&
		yearlyVariantPricing &&
		( ! introOffer || introOffer.isOfferComplete )
	) {
		const yearlyVariantMaybeDiscountedPrice =
			yearlyVariantPricing.discountedPrice?.monthly || yearlyVariantPricing.originalPrice?.monthly;

		if (
			yearlyVariantMaybeDiscountedPrice &&
			yearlyVariantMaybeDiscountedPrice < originalPrice.monthly
		) {
			return translate( `Save %(discountRate)s%% by paying annually`, {
				args: {
					discountRate: Math.floor(
						( 100 * ( originalPrice.monthly - yearlyVariantMaybeDiscountedPrice ) ) /
							originalPrice.monthly
					),
				},
			} );
		}

		return null;
	}

	const discountedPriceFullTermText =
		currencyCode && discountedPrice?.full
			? formatCurrency( discountedPrice.full, currencyCode, {
					stripZeros: true,
					isSmallestUnit: true,
			  } )
			: null;
	const originalPriceFullTermText =
		currencyCode && originalPrice?.full
			? formatCurrency( originalPrice.full, currencyCode, {
					stripZeros: true,
					isSmallestUnit: true,
			  } )
			: null;

	/*
	 * The introOffer billing should fall below into the next block once experiment with Woo plans is finalized.
	 *   1. We only expose introOffers to monthly & yearly plans for now (so no need to introduce more translations just yet)
	 *   2. We only expose month & year based intervals for now (so no need to introduce more translations just yet)
	 */
	if ( introOffer?.intervalCount && introOffer.intervalUnit && ! introOffer.isOfferComplete ) {
		if ( originalPriceFullTermText ) {
			if ( isMonthlyPlan ) {
				if ( 1 === introOffer.intervalCount ) {
					return translate(
						'per month, for your first %(introOfferIntervalUnit)s,{{br/}}' +
							'then %(rawPrice)s billed monthly, excl. taxes',
						{
							args: {
								rawPrice: originalPriceFullTermText,
								introOfferIntervalUnit: introOffer.intervalUnit,
							},
							components: { br: <br /> },
							comment: 'excl. taxes is short for excluding taxes',
						}
					);
				}

				if ( 'month' === introOffer.intervalUnit ) {
					return translate(
						'for your first %(introOfferIntervalCount)s months,{{br/}}' +
							'then %(rawPrice)s billed monthly, excl. taxes',
						{
							args: {
								rawPrice: originalPriceFullTermText,
								introOfferIntervalCount: introOffer.intervalCount,
							},
							components: { br: <br /> },
							comment: 'excl. taxes is short for excluding taxes',
						}
					);
				}

				if ( 'year' === introOffer.intervalUnit ) {
					return translate(
						'per month, for your first %(introOfferIntervalCount)s years,{{br/}}' +
							'then %(rawPrice)s billed monthly, excl. taxes',
						{
							args: {
								rawPrice: originalPriceFullTermText,
								introOfferIntervalCount: introOffer.intervalCount,
							},
							components: { br: <br /> },
							comment: 'excl. taxes is short for excluding taxes',
						}
					);
				}
			}

			if ( PLAN_ANNUAL_PERIOD === billingPeriod ) {
				if ( 1 === introOffer.intervalCount ) {
					return translate(
						'per month, for your first %(introOfferIntervalUnit)s,{{br/}}' +
							'then %(rawPrice)s billed annually, excl. taxes',
						{
							args: {
								rawPrice: originalPriceFullTermText,
								introOfferIntervalUnit: introOffer.intervalUnit,
							},
							components: { br: <br /> },
							comment: 'excl. taxes is short for excluding taxes',
						}
					);
				}

				if ( 'month' === introOffer.intervalUnit ) {
					return translate(
						'for your first %(introOfferIntervalCount)s months,{{br/}}' +
							'then %(rawPrice)s billed annually, excl. taxes',
						{
							args: {
								rawPrice: originalPriceFullTermText,
								introOfferIntervalCount: introOffer.intervalCount,
							},
							components: { br: <br /> },
							comment: 'excl. taxes is short for excluding taxes',
						}
					);
				}

				if ( 'year' === introOffer.intervalUnit ) {
					return translate(
						'per month, for your first %(introOfferIntervalCount)s years,{{br/}}' +
							'then %(rawPrice)s billed annually, excl. taxes',
						{
							args: {
								rawPrice: originalPriceFullTermText,
								introOfferIntervalCount: introOffer.intervalCount,
							},
							components: { br: <br /> },
							comment: 'excl. taxes is short for excluding taxes',
						}
					);
				}
			}
		}
		/*
		 * Early return here is for sanity. We don't want to show regular billing descriptions
		 * if there is an introOffer (despite that will not be the case, unless some API-level bug happens)
		 */
		return null;
	}

	/**
	 * If this discount is related to a `Plan upgrade credit`
	 * then we do not show any discount messaging as per Automattic/martech#1927
	 */
	if ( discountedPriceFullTermText && ! planUpgradeCreditsApplicable ) {
		if ( PLAN_ANNUAL_PERIOD === billingPeriod ) {
			return translate(
				'per month, %(fullTermDiscountedPriceText)s for the first year, excl. taxes',
				{
					args: { fullTermDiscountedPriceText: discountedPriceFullTermText },
					comment: 'Excl. Taxes is short for excluding taxes',
				}
			);
		}

		if ( PLAN_BIENNIAL_PERIOD === billingPeriod ) {
			return translate(
				'per month, %(fullTermDiscountedPriceText)s for the first two years, excl. taxes',
				{
					args: { fullTermDiscountedPriceText: discountedPriceFullTermText },
					comment: 'Excl. Taxes is short for excluding taxes',
				}
			);
		}

		if ( PLAN_TRIENNIAL_PERIOD === billingPeriod ) {
			return translate(
				'per month, %(fullTermDiscountedPriceText)s for the first three years, excl. taxes',
				{
					args: { fullTermDiscountedPriceText: discountedPriceFullTermText },
					comment: 'Excl. Taxes is short for excluding taxes',
				}
			);
		}
	} else if ( originalPriceFullTermText ) {
		if ( PLAN_ANNUAL_PERIOD === billingPeriod ) {
			return translate( 'per month, %(rawPrice)s billed annually, excl. taxes', {
				args: { rawPrice: originalPriceFullTermText },
				comment: 'Excl. Taxes is short for excluding taxes',
			} );
		}

		if ( PLAN_BIENNIAL_PERIOD === billingPeriod ) {
			return translate( 'per month, %(rawPrice)s billed every two years, excl. taxes', {
				args: { rawPrice: originalPriceFullTermText },
				comment: 'Excl. Taxes is short for excluding taxes',
			} );
		}

		if ( PLAN_TRIENNIAL_PERIOD === billingPeriod ) {
			return translate( 'per month, %(rawPrice)s billed every three years, excl. taxes', {
				args: { rawPrice: originalPriceFullTermText },
				comment: 'Excl. Taxes is short for excluding taxes',
			} );
		}
	}

	return null;
}
