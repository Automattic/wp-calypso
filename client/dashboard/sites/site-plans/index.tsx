import { WooHostedPlans } from '@automattic/api-core';
import { plansQuery, sitePlansQuery, siteBySlugQuery } from '@automattic/api-queries';
import { formatCurrency, getCurrencyObject } from '@automattic/number-formatters';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
	Icon,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { check, lineSolid } from '@wordpress/icons';
import { Fragment, useState } from 'react';
import { siteRoute } from '../../app/router/sites';
import { Card, CardBody } from '../../components/card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { wpcomLink } from '../../utils/link';
import type {
	PlanProduct,
	PlanProductComparisonGroup,
	SiteContextualPlan,
	Site,
} from '@automattic/api-core';
import './style.scss';

type BillingInterval = 'monthly' | 'yearly';

const PLAN_TIER: Record< string, number > = {
	[ WooHostedPlans.WOO_HOSTED_FREE_PLAN ]: 0,
	[ WooHostedPlans.WOO_HOSTED_FREE_TRIAL_PLAN_MONTHLY ]: 0,
	[ WooHostedPlans.WOO_HOSTED_BASIC_PLAN_MONTHLY ]: 1,
	[ WooHostedPlans.WOO_HOSTED_BASIC_PLAN_YEARLY ]: 1,
	[ WooHostedPlans.WOO_HOSTED_PRO_PLAN_MONTHLY ]: 2,
	[ WooHostedPlans.WOO_HOSTED_PRO_PLAN_YEARLY ]: 2,
};

function getPlanTier( slug: string ): number {
	return PLAN_TIER[ slug ] ?? -1;
}

function PlanPrice( {
	sitePlan,
	billingInterval,
	annualSitePlan,
}: {
	sitePlan: SiteContextualPlan;
	billingInterval: BillingInterval;
	annualSitePlan?: SiteContextualPlan;
} ) {
	if ( sitePlan.introductory_offer_formatted_price ) {
		const introPriceObj = getCurrencyObject(
			sitePlan.introductory_offer_raw_price ?? sitePlan.raw_price,
			sitePlan.currency_code
		);

		const originalPrice = sitePlan.raw_price + sitePlan.raw_discount;
		const regularPrice =
			billingInterval === 'yearly'
				? Math.round( ( originalPrice / 12 ) * 100 ) / 100
				: originalPrice;
		const regularPriceObj = getCurrencyObject( regularPrice, sitePlan.currency_code );

		const intervalUnit = sitePlan.introductory_offer_interval_unit ?? 'month';
		const intervalCount = sitePlan.introductory_offer_interval_count ?? 1;
		let introPeriod: string;
		if ( intervalUnit === 'year' ) {
			introPeriod =
				intervalCount === 1
					? __( 'your first year' )
					: sprintf(
							/* translators: %d is the number of years, e.g. "3" */
							__( 'your first %d years' ),
							intervalCount
					  );
		} else {
			introPeriod =
				intervalCount === 1
					? __( 'your first month' )
					: sprintf(
							/* translators: %d is the number of months, e.g. "3" */
							__( 'your first %d months' ),
							intervalCount
					  );
		}

		const formattedOriginalPrice = formatCurrency( originalPrice, sitePlan.currency_code, {
			stripZeros: true,
		} );
		const renewalNote =
			billingInterval === 'yearly'
				? sprintf(
						/* translators: 1: intro period (e.g. "your first month"), 2: annual price (e.g. "$588") */
						__( 'for %1$s, then %2$s billed annually, excl. taxes' ),
						introPeriod,
						formattedOriginalPrice
				  )
				: sprintf(
						/* translators: 1: intro period (e.g. "your first month"), 2: monthly price (e.g. "$49") */
						__( 'for %1$s, then %2$s/month, excl. taxes' ),
						introPeriod,
						formattedOriginalPrice
				  );

		return (
			<VStack spacing={ 1 }>
				<div className="site-plans__price-display">
					{ introPriceObj.symbolPosition === 'before' && (
						<sup className="site-plans__price-currency">{ introPriceObj.symbol }</sup>
					) }
					<span className="site-plans__price-number">
						{ introPriceObj.integer }
						{ introPriceObj.hasNonZeroFraction && introPriceObj.fraction }
					</span>
					{ introPriceObj.symbolPosition === 'after' && (
						<sup className="site-plans__price-currency">{ introPriceObj.symbol }</sup>
					) }
					<div className="site-plans__price-original">
						{ regularPriceObj.symbolPosition === 'before' && (
							<sup className="site-plans__price-currency site-plans__price-currency--original">
								{ regularPriceObj.symbol }
							</sup>
						) }
						<span className="site-plans__price-number site-plans__price-number--original">
							{ regularPriceObj.integer }
							{ regularPriceObj.hasNonZeroFraction && regularPriceObj.fraction }
						</span>
						{ regularPriceObj.symbolPosition === 'after' && (
							<sup className="site-plans__price-currency site-plans__price-currency--original">
								{ regularPriceObj.symbol }
							</sup>
						) }
					</div>
				</div>
				<Text className="site-plans__price-note" variant="muted">
					{ renewalNote }
				</Text>
			</VStack>
		);
	}

	// Use original (pre-proration) price for display throughout
	const originalPrice = sitePlan.raw_price + sitePlan.raw_discount;

	if ( billingInterval === 'yearly' ) {
		const perMonthRaw = Math.round( ( originalPrice / 12 ) * 100 ) / 100;
		const perMonthObj = getCurrencyObject( perMonthRaw, sitePlan.currency_code );
		return (
			<VStack spacing={ 1 }>
				<div className="site-plans__price-display">
					{ perMonthObj.symbolPosition === 'before' && (
						<sup className="site-plans__price-currency">{ perMonthObj.symbol }</sup>
					) }
					<span className="site-plans__price-number">
						{ perMonthObj.integer }
						{ perMonthObj.hasNonZeroFraction && perMonthObj.fraction }
					</span>
					{ perMonthObj.symbolPosition === 'after' && (
						<sup className="site-plans__price-currency">{ perMonthObj.symbol }</sup>
					) }
				</div>
				<Text className="site-plans__price-note" variant="muted">
					{ sprintf(
						/* translators: %s is the annual price, e.g. "€251" */
						__( 'per month, %s billed annually, excl. taxes' ),
						formatCurrency( originalPrice, sitePlan.currency_code, { stripZeros: true } )
					) }
				</Text>
			</VStack>
		);
	}

	const monthlyObj = getCurrencyObject( originalPrice, sitePlan.currency_code );
	const savingsPercent =
		annualSitePlan && originalPrice > 0
			? Math.round(
					( 1 - ( annualSitePlan.raw_price + annualSitePlan.raw_discount ) / 12 / originalPrice ) *
						100
			  )
			: 0;

	return (
		<VStack spacing={ 1 }>
			<div className="site-plans__price-display">
				{ monthlyObj.symbolPosition === 'before' && (
					<sup className="site-plans__price-currency">{ monthlyObj.symbol }</sup>
				) }
				<span className="site-plans__price-number">
					{ monthlyObj.integer }
					{ monthlyObj.hasNonZeroFraction && monthlyObj.fraction }
				</span>
				{ monthlyObj.symbolPosition === 'after' && (
					<sup className="site-plans__price-currency">{ monthlyObj.symbol }</sup>
				) }
			</div>
			{ savingsPercent > 0 && (
				<Text className="site-plans__price-note" variant="muted">
					{ sprintf(
						/* translators: %d is the savings percentage, e.g. "25" */
						__( 'Save %d%% by paying annually' ),
						savingsPercent
					) }
				</Text>
			) }
		</VStack>
	);
}

function PlanCardCTA( {
	site,
	sitePlan,
	currentPlanSlug,
	planCardName,
}: {
	site: Site;
	sitePlan: SiteContextualPlan;
	currentPlanSlug?: string;
	planCardName: string;
} ) {
	const currentTier = currentPlanSlug ? getPlanTier( currentPlanSlug ) : -1;
	const thisTier = getPlanTier( sitePlan.product_slug );
	const isCurrentPlan =
		sitePlan.current_plan === true || ( currentTier >= 0 && thisTier === currentTier );

	if ( isCurrentPlan ) {
		return (
			<Button variant="secondary" disabled className="site-plans__cta-button">
				{ __( 'Your plan' ) }
			</Button>
		);
	}

	if ( thisTier > currentTier ) {
		const checkoutURL = wpcomLink( `/checkout/${ site.slug }/${ sitePlan.product_slug }` );
		return (
			<Button variant="primary" href={ checkoutURL } className="site-plans__cta-button">
				{ sprintf(
					/* translators: %s is the plan name, e.g. "Pro" */
					__( 'Get %s' ),
					planCardName
				) }
			</Button>
		);
	}

	// Higher-tier plan is current; downgrade not offered
	return null;
}

function PlanCard( {
	site,
	sitePlan,
	planProduct,
	billingInterval,
	currentPlanSlug,
	annualSitePlan,
}: {
	site: Site;
	sitePlan: SiteContextualPlan;
	planProduct?: PlanProduct;
	billingInterval: BillingInterval;
	currentPlanSlug?: string;
	annualSitePlan?: SiteContextualPlan;
} ) {
	const currentTier = currentPlanSlug ? getPlanTier( currentPlanSlug ) : -1;
	const thisTier = getPlanTier( sitePlan.product_slug );
	const isCurrentPlan =
		sitePlan.current_plan === true || ( currentTier >= 0 && thisTier === currentTier );

	return (
		<Card className={ `site-plans__card${ isCurrentPlan ? ' site-plans__card--current' : '' }` }>
			<CardBody>
				<div className="site-plans__badge-slot">
					{ isCurrentPlan && (
						<span className="site-plans__current-badge">{ __( 'Your plan' ) }</span>
					) }
					{ ! isCurrentPlan && sitePlan.introductory_offer_formatted_price && (
						<span className="site-plans__special-offer-badge">{ __( 'Special Offer' ) }</span>
					) }
				</div>
				<VStack spacing={ 4 }>
					<VStack spacing={ 1 }>
						<Text className="site-plans__plan-name" size={ 20 } weight={ 600 }>
							{ planProduct?.plan_card_name ?? sitePlan.product_name }
						</Text>
						{ planProduct?.tagline && (
							<Text className="site-plans__tagline" variant="muted">
								{ planProduct.tagline }
							</Text>
						) }
						{ ! planProduct?.tagline && planProduct?.description && (
							<Text className="site-plans__tagline" variant="muted">
								{ planProduct.description }
							</Text>
						) }
					</VStack>

					<PlanPrice
						sitePlan={ sitePlan }
						billingInterval={ billingInterval }
						annualSitePlan={ annualSitePlan }
					/>

					<PlanCardCTA
						site={ site }
						sitePlan={ sitePlan }
						currentPlanSlug={ currentPlanSlug }
						planCardName={ planProduct?.plan_card_name ?? sitePlan.product_name }
					/>

					{ planProduct?.plan_card_features && planProduct.plan_card_features.length > 0 && (
						<ul className="site-plans__features">
							{ planProduct.plan_card_features.map( ( feature ) => (
								<li
									key={ feature.text }
									className={ `site-plans__feature-item${
										feature.available === false ? ' site-plans__feature-item--unavailable' : ''
									}` }
								>
									{ feature.text }
								</li>
							) ) }
						</ul>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}

function PlanComparisonSection( {
	comparisonGroups,
	basicPlanCardName,
	proPlanCardName,
	billPeriod,
	billingInterval,
	onBillingIntervalChange,
}: {
	comparisonGroups: PlanProductComparisonGroup[];
	basicPlanCardName: string | undefined;
	proPlanCardName: string | undefined;
	billPeriod: number | undefined;
	billingInterval: BillingInterval;
	onBillingIntervalChange: ( value: string | number | undefined ) => void;
} ) {
	return (
		<section className="site-plans__comparison">
			<div className="site-plans__comparison-header">
				<Text size={ 24 } weight={ 600 } className="site-plans__comparison-title">
					{ __( 'Compare our plans and find yours' ) }
				</Text>
				<ToggleGroupControl
					value={ billingInterval }
					isBlock
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					onChange={ onBillingIntervalChange }
					label={ __( 'Billing interval' ) }
					hideLabelFromVision
				>
					<ToggleGroupControlOption value="monthly" label={ __( 'Monthly' ) } />
					<ToggleGroupControlOption value="yearly" label={ __( 'Yearly' ) } />
				</ToggleGroupControl>
			</div>
			<Card className="site-plans__comparison-card">
				<table className="site-plans__comparison-table">
					<thead>
						<tr>
							<th />
							<th className="site-plans__comparison-plan-header">{ basicPlanCardName }</th>
							<th className="site-plans__comparison-plan-header">{ proPlanCardName }</th>
						</tr>
					</thead>
					<tbody>
						{ comparisonGroups.map( ( group ) => (
							<Fragment key={ group.group }>
								<tr className="site-plans__comparison-group-row">
									<th colSpan={ 3 }>{ group.group }</th>
								</tr>
								{ group.features.map( ( feature ) => {
									const isUnavailableOnMonthly =
										!! feature.billing_periods &&
										billPeriod !== undefined &&
										! feature.billing_periods.includes( billPeriod );
									return (
										<tr key={ feature.key }>
											<td>{ feature.title }</td>
											<td className="site-plans__comparison-check-cell">
												{ ! isUnavailableOnMonthly && feature.tiers.includes( 'basic' ) ? (
													<Icon
														icon={ check }
														size={ 20 }
														className="site-plans__comparison-check-icon"
													/>
												) : (
													<Icon
														icon={ lineSolid }
														size={ 20 }
														className="site-plans__comparison-dash-icon"
													/>
												) }
											</td>
											<td className="site-plans__comparison-check-cell">
												{ ! isUnavailableOnMonthly && feature.tiers.includes( 'pro' ) ? (
													<Icon
														icon={ check }
														size={ 20 }
														className="site-plans__comparison-check-icon"
													/>
												) : (
													<Icon
														icon={ lineSolid }
														size={ 20 }
														className="site-plans__comparison-dash-icon"
													/>
												) }
											</td>
										</tr>
									);
								} ) }
							</Fragment>
						) ) }
					</tbody>
				</table>
			</Card>
		</section>
	);
}

export default function SitePlans() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	const [ billingInterval, setBillingInterval ] = useState< BillingInterval >( 'yearly' );

	const { data: sitePlans } = useQuery( {
		...sitePlansQuery( site.ID ),
		enabled: !! site.ID,
	} );
	const { data: planProducts } = useQuery( plansQuery() );

	const currentSitePlan = sitePlans?.find( ( p ) => p.current_plan );
	const currentPlanSlug = currentSitePlan?.product_slug ?? site.plan?.product_slug;

	const basicSlug =
		billingInterval === 'yearly'
			? WooHostedPlans.WOO_HOSTED_BASIC_PLAN_YEARLY
			: WooHostedPlans.WOO_HOSTED_BASIC_PLAN_MONTHLY;

	const proSlug =
		billingInterval === 'yearly'
			? WooHostedPlans.WOO_HOSTED_PRO_PLAN_YEARLY
			: WooHostedPlans.WOO_HOSTED_PRO_PLAN_MONTHLY;

	const basicSitePlan = sitePlans?.find( ( p ) => p.product_slug === basicSlug );
	const proSitePlan = sitePlans?.find( ( p ) => p.product_slug === proSlug );

	const basicAnnualSitePlan =
		billingInterval === 'monthly'
			? sitePlans?.find( ( p ) => p.product_slug === WooHostedPlans.WOO_HOSTED_BASIC_PLAN_YEARLY )
			: undefined;
	const proAnnualSitePlan =
		billingInterval === 'monthly'
			? sitePlans?.find( ( p ) => p.product_slug === WooHostedPlans.WOO_HOSTED_PRO_PLAN_YEARLY )
			: undefined;

	const planProductMap = new Map< string, PlanProduct >(
		( planProducts ?? [] ).map( ( p ) => [ p.product_slug, p ] )
	);

	const comparisonGroups =
		planProductMap.get( basicSlug )?.features_comparison ??
		planProductMap.get( proSlug )?.features_comparison;

	const handleBillingIntervalChange = ( value: string | number | undefined ) => {
		if ( value === 'monthly' || value === 'yearly' ) {
			setBillingInterval( value );
		}
	};

	return (
		<PageLayout
			header={
				<PageHeader
					actions={
						<ToggleGroupControl
							value={ billingInterval }
							isBlock
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							onChange={ handleBillingIntervalChange }
							label={ __( 'Billing interval' ) }
							hideLabelFromVision
						>
							<ToggleGroupControlOption value="monthly" label={ __( 'Monthly' ) } />
							<ToggleGroupControlOption value="yearly" label={ __( 'Yearly' ) } />
						</ToggleGroupControl>
					}
				/>
			}
		>
			<div className="site-plans__grid">
				{ basicSitePlan && (
					<PlanCard
						site={ site }
						sitePlan={ basicSitePlan }
						planProduct={ planProductMap.get( basicSitePlan.product_slug ) }
						billingInterval={ billingInterval }
						currentPlanSlug={ currentPlanSlug }
						annualSitePlan={ basicAnnualSitePlan }
					/>
				) }
				{ proSitePlan && (
					<PlanCard
						site={ site }
						sitePlan={ proSitePlan }
						planProduct={ planProductMap.get( proSitePlan.product_slug ) }
						billingInterval={ billingInterval }
						currentPlanSlug={ currentPlanSlug }
						annualSitePlan={ proAnnualSitePlan }
					/>
				) }
			</div>
			{ comparisonGroups && (
				<PlanComparisonSection
					comparisonGroups={ comparisonGroups }
					basicPlanCardName={
						planProductMap.get( basicSlug )?.plan_card_name ?? basicSitePlan?.product_name
					}
					proPlanCardName={
						planProductMap.get( proSlug )?.plan_card_name ?? proSitePlan?.product_name
					}
					billPeriod={
						planProductMap.get( basicSlug )?.bill_period ??
						planProductMap.get( proSlug )?.bill_period
					}
					billingInterval={ billingInterval }
					onBillingIntervalChange={ handleBillingIntervalChange }
				/>
			) }
		</PageLayout>
	);
}
