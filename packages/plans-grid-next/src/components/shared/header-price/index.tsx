import { isWpcomEnterpriseGridPlan, type PlanSlug } from '@automattic/calypso-products';
import { PlanPrice } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { usePlansGridContext } from '../../../grid-context';
import useIsLargeCurrency from '../../../hooks/use-is-large-currency';
import { usePlanPricingInfoFromGridPlans } from '../../../hooks/use-plan-pricing-info-from-grid-plans';
import type { GridPlan } from '../../../types';
import './style.scss';

interface HeaderPriceProps {
	planSlug: PlanSlug;
	currentSitePlanSlug?: string | null;
	visibleGridPlans: GridPlan[];
}

const HeaderPrice = ( { planSlug, visibleGridPlans }: HeaderPriceProps ) => {
	const translate = useTranslate();
	const { gridPlansIndex } = usePlansGridContext();
	const {
		current,
		pricing: { currencyCode, originalPrice, discountedPrice, introOffer },
	} = gridPlansIndex[ planSlug ];
	const isPricedPlan = null !== originalPrice.monthly;

	/**
	 * If this discount is related to a `Plan upgrade credit`
	 * then we do not show any discount messaging as per Automattic/martech#1927
	 * We currently only support the `One time discount` in some currencies
	 */
	const isGridPlanOneTimeDiscounted = Boolean( discountedPrice.monthly );
	const isAnyVisibleGridPlanOneTimeDiscounted = visibleGridPlans.some(
		( { pricing } ) => pricing.discountedPrice.monthly
	);

	const isGridPlanOnIntroOffer = introOffer && ! introOffer.isOfferComplete;
	const isAnyVisibleGridPlanOnIntroOffer = visibleGridPlans.some(
		( { pricing } ) => pricing.introOffer && ! pricing.introOffer.isOfferComplete
	);

	const { prices } = usePlanPricingInfoFromGridPlans( { gridPlans: visibleGridPlans } );
	const isLargeCurrency = useIsLargeCurrency( { prices, currencyCode: currencyCode || 'USD' } );

	if ( isWpcomEnterpriseGridPlan( planSlug ) || ! isPricedPlan ) {
		return null;
	}

	if ( isGridPlanOnIntroOffer ) {
		const introOfferPrice =
			introOffer.intervalUnit === 'year'
				? parseFloat( ( introOffer.rawPrice / ( introOffer.intervalCount * 12 ) ).toFixed( 2 ) )
				: introOffer.rawPrice;
		return (
			<div className="plans-grid-next-header-price">
				{ ! current && (
					<div className="plans-grid-next-header-price__badge is-intro-offer">
						{ translate( 'Limited Time Offer' ) }
					</div>
				) }
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
							rawPrice={ introOfferPrice }
							displayPerMonthNotation={ false }
							isLargeCurrency
							isSmallestUnit={ false }
							priceDisplayWrapperClassName="plans-grid-next-header-price__display-wrapper"
							discounted
						/>
					</div>
				) : (
					<PlanPrice
						currencyCode={ currencyCode }
						rawPrice={ introOfferPrice }
						displayPerMonthNotation={ false }
						isSmallestUnit={ false }
						priceDisplayWrapperClassName="plans-grid-next-header-price__display-wrapper"
					/>
				) }
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

	if ( isAnyVisibleGridPlanOneTimeDiscounted || isAnyVisibleGridPlanOnIntroOffer ) {
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
