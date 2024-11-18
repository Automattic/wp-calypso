import {
	getPlanSlugForTermVariant,
	isWpcomEnterpriseGridPlan,
	PERIOD_LIST,
	TERM_MONTHLY,
	type PlanSlug,
} from '@automattic/calypso-products';
import { PlanPrice } from '@automattic/components';
import { AddOns, Plans } from '@automattic/data-stores';
import { useEffect } from '@wordpress/element';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { usePlansGridContext } from '../../../grid-context';
import useIsLargeCurrency from '../../../hooks/use-is-large-currency';
import { usePlanPricingInfoFromGridPlans } from '../../../hooks/use-plan-pricing-info-from-grid-plans';
import { useHeaderPriceContext } from './header-price-context';
import type { GridPlan } from '../../../types';
import './style.scss';

interface HeaderPriceProps {
	planSlug: PlanSlug;
	currentSitePlanSlug?: string | null;
	visibleGridPlans: GridPlan[];
}

/**
 * Returns the term variant plan slug for savings calculation.
 * This currently resolves to the monthly plan slug for annual/biennial/triennial plans.
 */
const useTermVariantPlanSlugForSavings = ( {
	planSlug,
	billingPeriod,
}: {
	planSlug: PlanSlug;
	billingPeriod?: -1 | ( typeof PERIOD_LIST )[ number ];
} ) => {
	// If the billing period is yearly or above, we return the monthly variant's plan slug
	if ( billingPeriod && 365 <= billingPeriod ) {
		return getPlanSlugForTermVariant( planSlug, TERM_MONTHLY );
	}

	return null;
};

const HeaderPrice = ( { planSlug, visibleGridPlans }: HeaderPriceProps ) => {
	const translate = useTranslate();
	const { gridPlansIndex, enableTermSavingsPriceDisplay, siteId, coupon, helpers } =
		usePlansGridContext();
	const { isAnyPlanPriceDiscounted, setIsAnyPlanPriceDiscounted } = useHeaderPriceContext();
	const {
		current,
		pricing: { currencyCode, originalPrice, discountedPrice, introOffer, billingPeriod },
	} = gridPlansIndex[ planSlug ];
	const isPricedPlan = null !== originalPrice.monthly;

	/**
	 * If this discount is related to a `Plan upgrade credit`
	 * then we do not show any discount messaging as per Automattic/martech#1927
	 * We currently only support the `One time discount` in some currencies
	 */
	const isGridPlanOneTimeDiscounted = Number.isFinite( discountedPrice.monthly );
	const isGridPlanOnIntroOffer = introOffer && ! introOffer.isOfferComplete;

	const { prices } = usePlanPricingInfoFromGridPlans( { gridPlans: visibleGridPlans } );
	const isLargeCurrency = useIsLargeCurrency( {
		prices,
		currencyCode: currencyCode || 'USD',
		ignoreWhitespace: true,
	} );

	const storageAddOns = AddOns.useStorageAddOns( { siteId } );
	const termVariantPlanSlug = useTermVariantPlanSlugForSavings( { planSlug, billingPeriod } );
	const termVariantPricing = Plans.usePricingMetaForGridPlans( {
		planSlugs: termVariantPlanSlug ? [ termVariantPlanSlug ] : [],
		storageAddOns,
		coupon,
		siteId,
		useCheckPlanAvailabilityForPurchase: helpers?.useCheckPlanAvailabilityForPurchase,
	} )?.[ termVariantPlanSlug ?? '' ];

	const termVariantPrice =
		termVariantPricing?.discountedPrice.monthly ?? termVariantPricing?.originalPrice.monthly ?? 0;
	const planPrice = discountedPrice.monthly ?? originalPrice.monthly ?? 0;
	const savings =
		termVariantPrice > planPrice
			? Math.floor( ( ( termVariantPrice - planPrice ) / termVariantPrice ) * 100 )
			: 0;

	useEffect( () => {
		if (
			isGridPlanOneTimeDiscounted ||
			isGridPlanOnIntroOffer ||
			( enableTermSavingsPriceDisplay && savings )
		) {
			setIsAnyPlanPriceDiscounted( true );
		}
	}, [
		enableTermSavingsPriceDisplay,
		isGridPlanOnIntroOffer,
		isGridPlanOneTimeDiscounted,
		savings,
		setIsAnyPlanPriceDiscounted,
	] );

	if ( isWpcomEnterpriseGridPlan( planSlug ) || ! isPricedPlan ) {
		return null;
	}

	if ( isGridPlanOnIntroOffer ) {
		return (
			<div className="plans-grid-next-header-price">
				{ ! current && (
					<div className="plans-grid-next-header-price__badge">
						{ translate( 'Special Offer' ) }
					</div>
				) }
				<div
					className={ clsx( 'plans-grid-next-header-price__pricing-group', {
						'is-large-currency': isLargeCurrency,
					} ) }
				>
					<PlanPrice
						currencyCode={ currencyCode }
						rawPrice={ originalPrice.monthly }
						displayPerMonthNotation={ false }
						isLargeCurrency
						isSmallestUnit
						priceDisplayWrapperClassName="plans-grid-next-header-price__display-wrapper"
						original
					/>
					<PlanPrice
						currencyCode={ currencyCode }
						rawPrice={
							typeof discountedPrice.monthly === 'number'
								? discountedPrice.monthly
								: introOffer.rawPrice.monthly
						}
						displayPerMonthNotation={ false }
						isLargeCurrency
						isSmallestUnit
						priceDisplayWrapperClassName="plans-grid-next-header-price__display-wrapper"
						discounted
					/>
				</div>
			</div>
		);
	}

	if ( isGridPlanOneTimeDiscounted ) {
		return (
			<div className="plans-grid-next-header-price">
				<div className="plans-grid-next-header-price__badge">
					{ translate( 'One time discount' ) }
				</div>
				<div
					className={ clsx( 'plans-grid-next-header-price__pricing-group', {
						'is-large-currency': isLargeCurrency,
					} ) }
				>
					<PlanPrice
						currencyCode={ currencyCode }
						rawPrice={ originalPrice.monthly }
						displayPerMonthNotation={ false }
						isLargeCurrency={ isLargeCurrency }
						isSmallestUnit
						priceDisplayWrapperClassName="plans-grid-next-header-price__display-wrapper"
						original
					/>
					<PlanPrice
						currencyCode={ currencyCode }
						rawPrice={ discountedPrice.monthly }
						displayPerMonthNotation={ false }
						isLargeCurrency={ isLargeCurrency }
						isSmallestUnit
						priceDisplayWrapperClassName="plans-grid-next-header-price__display-wrapper"
						discounted
					/>
				</div>
			</div>
		);
	}

	if ( enableTermSavingsPriceDisplay && termVariantPricing && savings ) {
		return (
			<div className="plans-grid-next-header-price">
				<div className="plans-grid-next-header-price__badge">
					{ translate( 'Save %(savings)d%%', {
						args: { savings },
						comment: 'Example: Save 35%',
					} ) }
				</div>
				<div
					className={ clsx( 'plans-grid-next-header-price__pricing-group', {
						'is-large-currency': isLargeCurrency,
					} ) }
				>
					<PlanPrice
						currencyCode={ currencyCode }
						rawPrice={ termVariantPricing.originalPrice.monthly }
						displayPerMonthNotation={ false }
						isLargeCurrency={ isLargeCurrency }
						isSmallestUnit
						priceDisplayWrapperClassName="plans-grid-next-header-price__display-wrapper"
						original
					/>
					<PlanPrice
						currencyCode={ currencyCode }
						rawPrice={ discountedPrice.monthly ?? originalPrice.monthly }
						displayPerMonthNotation={ false }
						isLargeCurrency={ isLargeCurrency }
						isSmallestUnit
						priceDisplayWrapperClassName="plans-grid-next-header-price__display-wrapper"
						discounted
					/>
				</div>
			</div>
		);
	}

	if ( isAnyPlanPriceDiscounted ) {
		return (
			<div className="plans-grid-next-header-price">
				<div className="plans-grid-next-header-price__badge is-hidden">' '</div>
				{ isLargeCurrency ? (
					<div className="plans-grid-next-header-price__pricing-group is-large-currency">
						<PlanPrice
							currencyCode={ currencyCode }
							rawPrice={ 0 }
							displayPerMonthNotation={ false }
							isLargeCurrency
							isSmallestUnit
							priceDisplayWrapperClassName="plans-grid-next-header-price__display-wrapper"
							className="is-placeholder-price" // This is a placeholder price to keep the layout consistent
							original
						/>
						<PlanPrice
							currencyCode={ currencyCode }
							rawPrice={ originalPrice.monthly }
							displayPerMonthNotation={ false }
							isLargeCurrency
							isSmallestUnit
							priceDisplayWrapperClassName="plans-grid-next-header-price__display-wrapper"
							discounted
						/>
					</div>
				) : (
					<PlanPrice
						currencyCode={ currencyCode }
						rawPrice={ originalPrice.monthly }
						displayPerMonthNotation={ false }
						isSmallestUnit
						priceDisplayWrapperClassName="plans-grid-next-header-price__display-wrapper"
					/>
				) }
			</div>
		);
	}

	return (
		<div className="plans-grid-next-header-price">
			<PlanPrice
				currencyCode={ currencyCode }
				rawPrice={ originalPrice.monthly }
				displayPerMonthNotation={ false }
				isLargeCurrency={ isLargeCurrency }
				isSmallestUnit
				priceDisplayWrapperClassName="plans-grid-next-header-price__display-wrapper"
			/>
		</div>
	);
};

export default HeaderPrice;
