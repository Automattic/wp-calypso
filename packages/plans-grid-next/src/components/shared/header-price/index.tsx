import {
	getPlanSlugForTermVariant,
	isFreePlan,
	isWpcomEnterpriseGridPlan,
	PLAN_ANNUAL_PERIOD,
	PLAN_BIENNIAL_PERIOD,
	PLAN_MONTHLY_PERIOD,
	PLAN_TRIENNIAL_PERIOD,
	PERIOD_LIST,
	TERM_MONTHLY,
	type PlanSlug,
} from '@automattic/calypso-products';
import { PlanPrice } from '@automattic/components';
import { Plans } from '@automattic/data-stores';
import { formatCurrency } from '@automattic/number-formatters';
import { useEffect } from '@wordpress/element';
import clsx from 'clsx';
import { type TranslateResult, useTranslate } from 'i18n-calypso';
import { usePlansGridContext } from '../../../grid-context';
import useIsLargeCurrency from '../../../hooks/use-is-large-currency';
import { useManageTooltipToggle } from '../../../hooks/use-manage-tooltip-toggle';
import { usePlanPricingInfoFromGridPlans } from '../../../hooks/use-plan-pricing-info-from-grid-plans';
import {
	calculateDiscountPercentage,
	fromPricingMetaForGridPlan,
	getPlanPriceForDuration,
} from '../../../lib/plan-pricing-utils';
import ClientLogoList from '../../features-grid/client-logo-list';
import { Plans2023Tooltip } from '../../plans-2023-tooltip';
import { useHeaderPriceContext } from './header-price-context';
import type { GridPlan } from '../../../types';
import type { ReactNode } from 'react';
import './style.scss';

export const ALL_ENTERPRISE_LOGO_SLUGS = [
	'slack',
	'usa-today',
	'salesforce',
	'meta',
	'intuit',
	'capgemini',
	'news-corp',
	'samsung',
	'nasa',
];

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

const HeaderPriceBadgeTooltip = ( {
	children,
	className,
	planSlug,
	text,
	tooltipId,
}: {
	children: ReactNode;
	className: string;
	planSlug: PlanSlug;
	text: TranslateResult;
	tooltipId?: string;
} ) => {
	const [ activeTooltipId, setActiveTooltipId ] = useManageTooltipToggle();
	const badge = <span className={ className }>{ children }</span>;

	return (
		<Plans2023Tooltip
			id={ `plans-grid-next-header-price-badge-${ planSlug }-${ tooltipId ?? 'default' }` }
			text={ text }
			activeTooltipId={ activeTooltipId }
			setActiveTooltipId={ setActiveTooltipId }
		>
			{ badge }
		</Plans2023Tooltip>
	);
};

const getPricingBadgeTooltipText = ( {
	billingPeriod,
	cheaperPrice,
	currencyCode,
	referencePrice,
	translate,
}: {
	billingPeriod?: -1 | ( typeof PERIOD_LIST )[ number ];
	cheaperPrice?: number | null;
	currencyCode?: string | null;
	referencePrice?: number | null;
	translate: ReturnType< typeof useTranslate >;
} ): TranslateResult | undefined => {
	if (
		! currencyCode ||
		typeof cheaperPrice !== 'number' ||
		typeof referencePrice !== 'number' ||
		! Number.isFinite( cheaperPrice ) ||
		! Number.isFinite( referencePrice )
	) {
		return undefined;
	}
	const args = {
		cheaperPrice: formatCurrency( cheaperPrice, currencyCode, {
			isSmallestUnit: true,
			stripZeros: true,
		} ),
		referencePrice: formatCurrency( referencePrice, currencyCode, {
			isSmallestUnit: true,
			stripZeros: true,
		} ),
	};

	switch ( billingPeriod ) {
		case PLAN_MONTHLY_PERIOD:
			return translate( '%(cheaperPrice)s/first month vs. %(referencePrice)s monthly after that', {
				args,
				comment: 'Example: $5/first month vs. $10 monthly after that',
			} );
		case PLAN_BIENNIAL_PERIOD:
			return translate( '%(cheaperPrice)s/2 years vs. %(referencePrice)s paying monthly', {
				args,
				comment: 'Example: $200/2 years vs. $300 paying monthly',
			} );
		case PLAN_TRIENNIAL_PERIOD:
			return translate( '%(cheaperPrice)s/3 years vs. %(referencePrice)s paying monthly', {
				args,
				comment: 'Example: $300/3 years vs. $450 paying monthly',
			} );
		case PLAN_ANNUAL_PERIOD:
		default:
			return translate( '%(cheaperPrice)s/year vs. %(referencePrice)s paying monthly', {
				args,
				comment: 'Example: $100/year vs. $150 paying monthly',
			} );
	}
};

const HeaderPrice = ( { planSlug, visibleGridPlans }: HeaderPriceProps ) => {
	const translate = useTranslate();
	const {
		gridPlansIndex,
		enableTermSavingsPriceDisplay,
		reflectStorageSelectionInPlanPrices,
		siteId,
		coupon,
		helpers,
		showBillingDescriptionForIncreasedRenewalPrice,
		isExperimentVariant,
		showFeatureCheckmarks,
		isEnterpriseA4AIndia,
	} = usePlansGridContext();

	const pricingBadgeClassName = clsx( 'plans-grid-next-header-price__badge', {
		'is-plan-differentiators-experiment-badge': isExperimentVariant,
	} );
	const showPricingBadgeTooltip = isExperimentVariant && showFeatureCheckmarks;
	const { isAnyPlanPriceDiscounted, setIsAnyPlanPriceDiscounted } = useHeaderPriceContext();
	const {
		current,
		pricing: { currencyCode, originalPrice, discountedPrice, introOffer, billingPeriod },
		isMonthlyPlan,
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
	const isLargeCurrency =
		useIsLargeCurrency( {
			prices,
			currencyCode: currencyCode || 'USD',
			ignoreWhitespace: true,
		} ) && ! showBillingDescriptionForIncreasedRenewalPrice; // a temporary fix to handle an issue with isLargeCurrency logic for intro offers

	const termVariantPlanSlug = useTermVariantPlanSlugForSavings( { planSlug, billingPeriod } );
	const termVariantPricing = Plans.usePricingMetaForGridPlans( {
		planSlugs: termVariantPlanSlug ? [ termVariantPlanSlug ] : [],
		reflectStorageSelectionInPlanPrices,
		coupon,
		siteId,
		useCheckPlanAvailabilityForPurchase: helpers?.useCheckPlanAvailabilityForPurchase,
	} )?.[ termVariantPlanSlug ?? '' ];

	const termVariantInfo = termVariantPricing
		? fromPricingMetaForGridPlan( termVariantPricing )
		: null;
	const currentPlanInfo = fromPricingMetaForGridPlan( gridPlansIndex[ planSlug ].pricing );
	const termVariantReferencePrice =
		termVariantInfo && currentPlanInfo
			? getPlanPriceForDuration( termVariantInfo, currentPlanInfo.termMonths )
			: null;
	const currentPlanPrice =
		termVariantInfo && currentPlanInfo
			? getPlanPriceForDuration( currentPlanInfo, currentPlanInfo.termMonths )
			: null;
	const termSavingsTooltipText = getPricingBadgeTooltipText( {
		billingPeriod,
		cheaperPrice: currentPlanPrice,
		currencyCode,
		referencePrice: termVariantReferencePrice,
		translate,
	} );
	let savings =
		termVariantReferencePrice && currentPlanPrice
			? calculateDiscountPercentage( termVariantReferencePrice, currentPlanPrice ) ?? 0
			: 0;

	const renderPricingBadge = (
		children: ReactNode,
		{
			isHidden = false,
			tooltipText,
			tooltipId,
		}: {
			isHidden?: boolean;
			tooltipText?: TranslateResult;
			tooltipId?: string;
		} = {}
	) => {
		const className = clsx( pricingBadgeClassName, { 'is-hidden': isHidden } );

		if ( isHidden || ! showPricingBadgeTooltip || ! tooltipText ) {
			return <div className={ className }>{ children }</div>;
		}

		return (
			<HeaderPriceBadgeTooltip
				className={ className }
				planSlug={ planSlug }
				text={ tooltipText }
				tooltipId={ tooltipId }
			>
				{ children }
			</HeaderPriceBadgeTooltip>
		);
	};

	useEffect( () => {
		if (
			isGridPlanOneTimeDiscounted ||
			isGridPlanOnIntroOffer ||
			( enableTermSavingsPriceDisplay && savings ) ||
			( showBillingDescriptionForIncreasedRenewalPrice && !! termVariantPricing )
		) {
			setIsAnyPlanPriceDiscounted( true );
		}
	}, [
		enableTermSavingsPriceDisplay,
		isGridPlanOnIntroOffer,
		isGridPlanOneTimeDiscounted,
		savings,
		setIsAnyPlanPriceDiscounted,
		showBillingDescriptionForIncreasedRenewalPrice,
		termVariantPricing,
	] );

	if ( isWpcomEnterpriseGridPlan( planSlug ) ) {
		// India A4A test: the Enterprise card doesn't show the client logos in the price cell.
		if ( isEnterpriseA4AIndia ) {
			return null;
		}
		const hasFreePlan = visibleGridPlans.some( ( { planSlug: slug } ) => isFreePlan( slug ) );
		const logoCount = hasFreePlan ? 7 : 9;
		return (
			<ClientLogoList
				slugs={ ALL_ENTERPRISE_LOGO_SLUGS.slice( 0, logoCount ) }
				className="plans-grid-next-header-price__enterprise-logos"
			/>
		);
	}

	if ( ! isPricedPlan ) {
		return null;
	}

	if ( isGridPlanOnIntroOffer ) {
		// Use the monthly plan price for renewal pricing, instead of the intro offer renewal price
		const compareToMonthlyPrice =
			( showBillingDescriptionForIncreasedRenewalPrice && termVariantPricing
				? termVariantPricing.originalPrice.monthly
				: originalPrice.monthly ) ?? 0;
		const monthlyPrice =
			typeof discountedPrice.monthly === 'number'
				? discountedPrice.monthly
				: introOffer.rawPrice.monthly;
		const introOfferTooltipText =
			billingPeriod === PLAN_MONTHLY_PERIOD
				? getPricingBadgeTooltipText( {
						billingPeriod,
						cheaperPrice: monthlyPrice,
						currencyCode,
						referencePrice: compareToMonthlyPrice,
						translate,
				  } )
				: termSavingsTooltipText;
		// Recalculate the savings for Monthly plans with introductory offers
		// since we are comparing the introductory price with the same plan
		// renewal price, instead of comparing yearly to monthly costs for
		// the same period.
		if (
			showBillingDescriptionForIncreasedRenewalPrice &&
			compareToMonthlyPrice > monthlyPrice &&
			isMonthlyPlan
		) {
			savings = calculateDiscountPercentage( compareToMonthlyPrice, monthlyPrice ) ?? 0;
		}
		return (
			<div className="plans-grid-next-header-price">
				{ ! current &&
					renderPricingBadge(
						showBillingDescriptionForIncreasedRenewalPrice
							? translate( 'Save %(savings)d%%', {
									args: { savings },
									comment: 'Example: Save 35%',
							  } )
							: translate( 'Special Offer' ),
						{ tooltipId: 'intro-offer', tooltipText: introOfferTooltipText }
					) }
				{ current &&
					visibleGridPlans.length > 1 &&
					renderPricingBadge( "' '", {
						isHidden: true,
						tooltipId: 'intro-offer-placeholder',
					} ) }
				<div
					className={ clsx( 'plans-grid-next-header-price__pricing-group', {
						'is-large-currency': isLargeCurrency,
					} ) }
				>
					<PlanPrice
						currencyCode={ currencyCode }
						rawPrice={ compareToMonthlyPrice }
						displayPerMonthNotation={ false }
						isLargeCurrency={ isLargeCurrency }
						isSmallestUnit
						priceDisplayWrapperClassName="plans-grid-next-header-price__display-wrapper"
						original
					/>
					<PlanPrice
						currencyCode={ currencyCode }
						rawPrice={ monthlyPrice }
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

	// Handle cases where a plan is ineligible for intro offer, but we still
	// want to show the crossed-out monthly price.
	if ( showBillingDescriptionForIncreasedRenewalPrice && termVariantPricing ) {
		const compareToMonthlyPrice = termVariantPricing.originalPrice.monthly ?? 0;
		const monthlyPrice =
			typeof discountedPrice.monthly === 'number'
				? discountedPrice.monthly
				: originalPrice.monthly ?? 0;
		return (
			<div className="plans-grid-next-header-price">
				{ ! current &&
					savings > 0 &&
					renderPricingBadge(
						translate( 'Save %(savings)d%%', {
							args: { savings },
							comment: 'Example: Save 35%',
						} ),
						{ tooltipId: 'renewal-savings', tooltipText: termSavingsTooltipText }
					) }
				{ ( ( ! current && savings <= 0 ) || ( current && visibleGridPlans.length > 1 ) ) &&
					renderPricingBadge( "' '", {
						isHidden: true,
						tooltipId: 'renewal-savings-placeholder',
					} ) }
				<div
					className={ clsx( 'plans-grid-next-header-price__pricing-group', {
						'is-large-currency': isLargeCurrency,
					} ) }
				>
					{ compareToMonthlyPrice > monthlyPrice && (
						<PlanPrice
							currencyCode={ currencyCode }
							rawPrice={ compareToMonthlyPrice }
							displayPerMonthNotation={ false }
							isLargeCurrency={ isLargeCurrency }
							isSmallestUnit
							priceDisplayWrapperClassName="plans-grid-next-header-price__display-wrapper"
							original
						/>
					) }
					<PlanPrice
						currencyCode={ currencyCode }
						rawPrice={ monthlyPrice }
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

	if ( isGridPlanOneTimeDiscounted ) {
		return (
			<div className="plans-grid-next-header-price">
				{ renderPricingBadge( translate( 'One time discount' ) ) }
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
				{ renderPricingBadge(
					translate( 'Save %(savings)d%%', {
						args: { savings },
						comment: 'Example: Save 35%',
					} ),
					{ tooltipId: 'term-savings', tooltipText: termSavingsTooltipText }
				) }
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
				{ showBillingDescriptionForIncreasedRenewalPrice && savings
					? renderPricingBadge(
							translate( 'Save %(savings)d%%', {
								args: { savings },
								comment: 'Example: Save 35%',
							} ),
							{ tooltipId: 'fallback-savings', tooltipText: termSavingsTooltipText }
					  )
					: renderPricingBadge( "' '", { isHidden: true, tooltipId: 'fallback-placeholder' } ) }
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
