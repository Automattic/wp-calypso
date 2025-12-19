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
import { Plans } from '@automattic/data-stores';
import { formatCurrency } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import { usePlansGridContext } from '../../grid-context';
import type { GridPlan } from '../../types';

interface UsePlanBillingDescriptionProps {
	siteId?: number | null;
	planSlug: PlanSlug;
	pricing: GridPlan[ 'pricing' ] | null;
	isMonthlyPlan?: boolean;
	coupon?: string;
	useCheckPlanAvailabilityForPurchase: Plans.UseCheckPlanAvailabilityForPurchase;
	reflectStorageSelectionInPlanPrices?: boolean;
}

export default function usePlanBillingDescription( {
	siteId,
	planSlug,
	pricing,
	isMonthlyPlan,
	coupon,
	useCheckPlanAvailabilityForPurchase,
}: UsePlanBillingDescriptionProps ) {
	const translate = useTranslate();
	const { currencyCode, originalPrice, discountedPrice, billingPeriod, introOffer } = pricing || {};
	const {
		reflectStorageSelectionInPlanPrices,
		showSimplifiedBillingDescription,
		renewalPricingVariation,
		enableCategorisedFeatures,
	} = usePlansGridContext();
	const yearlyVariantPlanSlug = getPlanSlugForTermVariant( planSlug, TERM_ANNUALLY );

	const yearlyVariantPricing = Plans.usePricingMetaForGridPlans( {
		planSlugs: yearlyVariantPlanSlug ? [ yearlyVariantPlanSlug ] : [],
		coupon,
		siteId,
		useCheckPlanAvailabilityForPurchase,
		reflectStorageSelectionInPlanPrices,
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
		// For renewal pricing experiment in FeaturesGrid, show "per month" and move savings text to post-button area
		// For ComparisonGrid, keep the original savings text above the button
		if ( renewalPricingVariation && enableCategorisedFeatures ) {
			return translate( 'per month' );
		}

		const yearlyVariantMaybeDiscountedPrice = Number.isFinite(
			yearlyVariantPricing.discountedPrice?.monthly
		)
			? yearlyVariantPricing.discountedPrice?.monthly
			: yearlyVariantPricing.originalPrice?.monthly;

		if (
			yearlyVariantMaybeDiscountedPrice &&
			yearlyVariantMaybeDiscountedPrice < originalPrice.monthly
		) {
			return translate( 'Save %(discountRate)s%% by paying annually', {
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
		currencyCode && typeof discountedPrice?.full === 'number'
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
	if (
		introOffer?.intervalCount &&
		introOffer.intervalUnit &&
		! introOffer.isOfferComplete &&
		! renewalPricingVariation
	) {
		const discountedPriceFull =
			typeof discountedPrice?.full === 'number' ? discountedPrice.full : introOffer?.rawPrice?.full;

		const introOfferFullTermText =
			currencyCode && typeof discountedPriceFull === 'number'
				? formatCurrency( discountedPriceFull, currencyCode, {
						stripZeros: true,
						isSmallestUnit: true,
				  } )
				: null;

		if ( originalPriceFullTermText && introOfferFullTermText ) {
			/* Introductory offers for monthly plans */
			if ( isMonthlyPlan ) {
				/* If the offer is for X months */
				if ( 'month' === introOffer.intervalUnit ) {
					if ( 1 === introOffer.intervalCount ) {
						return translate(
							'for your first month,{{br/}}' + 'then %(rawPrice)s billed monthly, excl. taxes',
							{
								args: {
									rawPrice: originalPriceFullTermText,
								},
								components: { br: <br /> },
								comment: 'excl. taxes is short for excluding taxes',
							}
						);
					}

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

				/* If the offer is for X years of monthly intervals */
				if ( 'year' === introOffer.intervalUnit ) {
					if ( 1 === introOffer.intervalCount ) {
						return translate(
							'for your first year,{{br/}}' + 'then %(rawPrice)s billed monthly, excl. taxes',
							{
								args: {
									rawPrice: originalPriceFullTermText,
								},
								components: { br: <br /> },
								comment: 'excl. taxes is short for excluding taxes',
							}
						);
					}

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

			/* Introductory offers for yearly plans */
			if ( PLAN_ANNUAL_PERIOD === billingPeriod ) {
				/* If the offer is for X months of a yearly plan */
				if ( 'month' === introOffer.intervalUnit ) {
					if ( 1 === introOffer.intervalCount ) {
						return translate(
							'for your first month,{{br/}}' + 'then %(rawPrice)s billed annually, excl. taxes',
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

				/* If the offer is for X years of a yearly plan */
				if ( 'year' === introOffer.intervalUnit ) {
					if ( 1 === introOffer.intervalCount ) {
						return translate(
							'per month, %(introOfferFormattedPrice)s for your first year,{{br/}}' +
								'then %(rawPrice)s billed annually, excl. taxes',
							{
								args: {
									introOfferFormattedPrice: introOfferFullTermText,
									rawPrice: originalPriceFullTermText,
								},
								components: { br: <br /> },
								comment: 'excl. taxes is short for excluding taxes',
							}
						);
					}

					return translate(
						'per month, %(introOfferFormattedPrice)s for your first %(introOfferIntervalCount)s years,{{br/}}' +
							'then %(rawPrice)s billed annually, excl. taxes',
						{
							args: {
								introOfferFormattedPrice: introOfferFullTermText,
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

	if ( discountedPriceFullTermText ) {
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
	} else if ( renewalPricingVariation ) {
		// For renewal pricing experiment, show variation-specific text
		// In FeaturesGrid (enableCategorisedFeatures), show "per month" and move renewal text below CTA
		// In ComparisonGrid, show full renewal text above CTA
		if ( enableCategorisedFeatures ) {
			return translate( 'per month' );
		}

		const monthlyPrice = originalPrice?.monthly;
		const currentFullPrice =
			introOffer?.rawPrice?.full || discountedPrice?.full || originalPrice?.full;
		if ( ! monthlyPrice || ! currencyCode || ! currentFullPrice ) {
			return null;
		}
		const formattedMonthlyPrice = formatCurrency( monthlyPrice, currencyCode, {
			stripZeros: true,
			isSmallestUnit: true,
		} );
		const formattedFullPrice = formatCurrency( currentFullPrice, currencyCode, {
			stripZeros: true,
			isSmallestUnit: true,
		} );

		// Determine the billing period in months
		let billingMonths = 12; // default to annual

		if ( PLAN_BIENNIAL_PERIOD === billingPeriod ) {
			billingMonths = 24;
		} else if ( PLAN_TRIENNIAL_PERIOD === billingPeriod ) {
			billingMonths = 36;
		} else if ( PLAN_ANNUAL_PERIOD === billingPeriod ) {
			billingMonths = 12;
		}

		// Different text based on variation
		if ( renewalPricingVariation === 'crossed_price' ) {
			return translate( 'Auto-renews at %(price)s per month. Billed every %(months)s months.', {
				args: {
					price: formattedMonthlyPrice,
					months: billingMonths,
				},
				comment:
					'%(price)s is a formatted price like $10, %(months)s is the billing period in months (12, 24, or 36)',
			} );
		} else if ( renewalPricingVariation === 'no_crossed_price' ) {
			return translate(
				'Get %(months)s months for %(fullPrice)s. Auto-renews at %(price)s per month.',
				{
					args: {
						months: billingMonths,
						fullPrice: formattedFullPrice,
						price: formattedMonthlyPrice,
					},
					comment:
						'%(months)s is the billing period (12, 24, or 36), %(fullPrice)s is the current/intro total price like $100, %(price)s is the renewal monthly price like $12',
				}
			);
		}

		return null;
	} else if ( showSimplifiedBillingDescription ) {
		// Use simplified billing description
		if ( PLAN_ANNUAL_PERIOD === billingPeriod ) {
			return translate( 'per month, billed every %(months)s months', {
				args: { months: 12 },
			} );
		}

		if ( PLAN_BIENNIAL_PERIOD === billingPeriod ) {
			return translate( 'per month, billed every %(months)s months', {
				args: { months: 24 },
			} );
		}

		if ( PLAN_TRIENNIAL_PERIOD === billingPeriod ) {
			return translate( 'per month, billed every %(months)s months', {
				args: { months: 36 },
			} );
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
