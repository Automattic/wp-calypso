import { plansQuery } from '@automattic/api-queries';
import {
	getFeatureByKey,
	getPlan,
	PLAN_PERSONAL,
	PLAN_PERSONAL_MONTHLY,
	PLAN_PREMIUM,
	PLAN_PREMIUM_MONTHLY,
	PLAN_BUSINESS,
	PLAN_BUSINESS_MONTHLY,
	type PlanSlug,
} from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { formatCurrency } from '@automattic/number-formatters';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { Icon, check } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { preventWidows } from 'calypso/lib/formatting';
import useCheckPlanAvailabilityForPurchase from 'calypso/my-sites/plans-features-main/hooks/use-check-plan-availability-for-purchase';
import { useSelector } from 'calypso/state';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';

import './style.scss';

interface PlanUpgradeBannerProps {
	planSlug: typeof PLAN_PERSONAL | typeof PLAN_PREMIUM | typeof PLAN_BUSINESS;
	variant?: 'light' | 'dark';
}

const monthlyPlansMap = {
	[ PLAN_PERSONAL ]: PLAN_PERSONAL_MONTHLY,
	[ PLAN_PREMIUM ]: PLAN_PREMIUM_MONTHLY,
	[ PLAN_BUSINESS ]: PLAN_BUSINESS_MONTHLY,
};

/**
 * Resolves the price a new purchase would pay for the first period: a discounted
 * price first, then an intro offer covering exactly one billing term, then the
 * regular price. Returns null while pricing is still loading.
 */
const getFirstPeriodPrice = (
	pricing: Plans.PricingMetaForGridPlan | undefined,
	term: 'month' | 'year'
): number | null => {
	if ( ! pricing ) {
		return null;
	}

	const { introOffer } = pricing;
	const introOfferPrice =
		introOffer &&
		! introOffer.isOfferComplete &&
		introOffer.intervalUnit === term &&
		introOffer.intervalCount === 1
			? introOffer.rawPrice.full
			: null;

	return pricing.discountedPrice.full || introOfferPrice || pricing.originalPrice.full || null;
};

const PlanUpgradeBanner = ( { planSlug, variant = 'light' }: PlanUpgradeBannerProps ) => {
	const translate = useTranslate();
	const [ isMonthly, setIsMonthly ] = useState< boolean >( false );
	// The CTA links to a plan path slug from the loaded plans query, so keep it
	// disabled until that data is available.
	const { data: plans } = useQuery( plansQuery() );

	const plan = getPlan( planSlug );

	const monthlyPlanSlug = monthlyPlansMap[ planSlug ];
	const monthlyPlan = getPlan( monthlyPlanSlug );

	const siteId = useSelector( getSelectedSiteId );
	const pricingMeta = Plans.usePricingMetaForGridPlans( {
		planSlugs: [ planSlug, monthlyPlanSlug ] as PlanSlug[],
		siteId,
		coupon: undefined,
		useCheckPlanAvailabilityForPurchase,
	} );
	const currencyCode =
		pricingMeta?.[ planSlug ]?.currencyCode ??
		pricingMeta?.[ monthlyPlanSlug ]?.currencyCode ??
		'USD';
	const costMonth = getFirstPeriodPrice( pricingMeta?.[ monthlyPlanSlug ], 'month' );
	const costYear = getFirstPeriodPrice( pricingMeta?.[ planSlug ], 'year' );
	const formatCost = ( cost: number | null ) =>
		cost === null
			? null
			: formatCurrency( cost, currencyCode, { stripZeros: true, isSmallestUnit: true } );
	const displayCostMonth = formatCost( costMonth );
	const displayCostYear = formatCost( costYear );

	const annualDiscount =
		costMonth && costYear ? Math.floor( ( 1 - costYear / ( costMonth * 12 ) ) * 100 ) : 0;

	const trackClick = useCallback( () => {
		recordTracksEvent( 'calypso_themeshowcase_plan_upgrade_banner_click', {
			plan: isMonthly ? monthlyPlanSlug : planSlug,
		} );
	}, [ isMonthly, monthlyPlanSlug, planSlug ] );

	if ( ! plan || ! monthlyPlan ) {
		return null;
	}

	const amount = isMonthly ? displayCostMonth : displayCostYear;
	const period = isMonthly ? translate( '/month' ) : translate( '/year' );
	const selectedPlanSlug = isMonthly ? monthlyPlanSlug : planSlug;
	const pathSlug =
		plans?.find( ( { product_slug } ) => product_slug === selectedPlanSlug )?.path_slug ||
		selectedPlanSlug;

	// @ts-ignore - getSignupFeatures is not typed as existing on all plan types, but it is in practice
	const featureSlugs: string[] = plan.getSignupFeatures();
	const features = featureSlugs.map( getFeatureByKey ).filter( Boolean );

	return (
		<div
			className={ clsx( 'banner-modern plan-upgrade-banner', { 'is-dark': variant === 'dark' } ) }
		>
			<div className="plan-upgrade-banner__plan">
				<h2 className="banner-modern__title plan-upgrade-banner__title">
					{
						// translators: %(planName)s is the plan name - e.g. Business or Premium
						translate( '%(planName)s plan', { args: { planName: plan.getTitle() } } )
					}
				</h2>
				<p className="banner-modern__description plan-upgrade-banner__description">
					{
						// @ts-ignore - getPlanTagline is not typed as existing on all plan types, but it is in practice
						preventWidows( plan.getPlanTagline() )
					}
				</p>
			</div>
			<div className="plan-upgrade-banner__features">
				<h3 className="plan-upgrade-banner__features-heading">
					{ translate( 'What’s included' ) }
				</h3>
				<ul className="plan-upgrade-banner__features-list">
					{ features.map( ( feature, index ) => (
						<li key={ index } className="plan-upgrade-banner__features-item">
							<div className="plan-upgrade-banner__check-icon">
								<Icon icon={ check } size={ 18 } />
							</div>
							<span>{ feature.getTitle() }</span>
						</li>
					) ) }
				</ul>
			</div>
			<div className="plan-upgrade-banner__pricing">
				<div className="plan-upgrade-banner__price">
					<span className="plan-upgrade-banner__price-amount">{ amount }</span>
					<span className="plan-upgrade-banner__price-period">{ period }</span>
				</div>
				<fieldset className="plan-upgrade-banner__billing-toggle">
					<label className="plan-upgrade-banner__billing-option">
						<input type="radio" checked={ isMonthly } onChange={ () => setIsMonthly( true ) } />
						<span>{ translate( 'Monthly' ) }</span>
					</label>
					<label className="plan-upgrade-banner__billing-option">
						<input type="radio" checked={ ! isMonthly } onChange={ () => setIsMonthly( false ) } />
						<span>{ translate( 'Annually' ) }</span>
						<span className="plan-upgrade-banner__billing-savings">
							{ annualDiscount
								? translate( '(save %(percent)s%%)', { args: { percent: annualDiscount } } )
								: '' }
						</span>
					</label>
				</fieldset>
				<Button
					className="plan-upgrade-banner__cta"
					variant="primary"
					href={ plans ? `/start/${ pathSlug }/?ref=themes-lp` : undefined }
					disabled={ ! plans }
					aria-disabled={ ! plans }
					onClick={ trackClick }
				>
					{
						// translators: %(planName)s is the plan name - e.g. Business or Premium
						translate( 'Get %(planName)s', { args: { planName: plan.getTitle() } } )
					}
				</Button>
			</div>
		</div>
	);
};

export default PlanUpgradeBanner;
