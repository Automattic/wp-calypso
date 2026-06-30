import { SubscriptionBillPeriod } from '@automattic/api-core';
import { sitePlansQuery, siteBySlugQuery } from '@automattic/api-queries';
import { formatCurrency, getCurrencyObject } from '@automattic/number-formatters';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useSearch } from '@tanstack/react-router';
import {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
	Icon,
	SelectControl,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { check, chevronLeft, lineSolid } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import React, { Fragment, useState } from 'react';
import { useAuth } from '../../app/auth';
import { useHelpCenter } from '../../app/help-center';
import { siteRoute, sitePlansRoute } from '../../app/router/sites';
import { Card, CardBody } from '../../components/card';
import InlineSupportLink from '../../components/inline-support-link';
import { Notice } from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { dashboardLink, wpcomLink } from '../../utils/link';
import { isRelativeUrl } from '../../utils/url';
import type {
	PlanProductComparisonGroup,
	SiteContextualPlan,
	Site,
	SubscriptionBillPeriodValue,
} from '@automattic/api-core';
import './style.scss';

type UpgradeCreditsSource = 'plan' | 'domain' | 'other-upgrades' | 'domain-and-other-upgrades';

type UpgradeCredit = { amount: number; currencyCode: string; source: UpgradeCreditsSource };

/**
 * Computes the upgrade credit to display in the notice banner, or null if none applies.
 *
 * A plan has upgrade credits when its raw_discount > 0 (proration from a current plan,
 * domain, or other upgrade). Returns the maximum credit across all upgradeable plans and
 * infers the source label from cost_overrides for the message text.
 */
function getUpgradeCredit(
	activePlans: Array< { sitePlan: SiteContextualPlan; tierRank: number } >,
	currentTierRank: number
): UpgradeCredit | null {
	let amount = 0;
	let currencyCode = '';
	let hasDomainProration = false;
	let hasOtherProration = false;

	for ( const ap of activePlans ) {
		if ( ap.tierRank <= currentTierRank ) {
			continue;
		}
		const plan = ap.sitePlan;
		if ( ! plan.has_sale_coupon && plan.raw_discount > amount ) {
			amount = plan.raw_discount;
			currencyCode = plan.currency_code;
		}
		for ( const override of plan.cost_overrides ) {
			if ( override.override_code === 'recent-domain-proration' ) {
				hasDomainProration = true;
			}
			if ( override.override_code === 'recent-plan-proration' ) {
				hasOtherProration = true;
			}
		}
	}

	if ( amount <= 0 ) {
		return null;
	}

	let source: UpgradeCreditsSource;
	if ( hasDomainProration && hasOtherProration ) {
		source = 'domain-and-other-upgrades';
	} else if ( hasDomainProration ) {
		source = 'domain';
	} else if ( hasOtherProration ) {
		source = 'other-upgrades';
	} else {
		// No explicit override code: infer from whether the user has a shown plan.
		// If they do (currentTierRank >= 0), this is likely a paid-plan upgrade credit.
		source = currentTierRank >= 0 ? 'plan' : 'other-upgrades';
	}

	return { amount, currencyCode, source };
}

function UpgradeCreditsNotice( {
	amount,
	currencyCode,
	source,
}: {
	amount: number;
	currencyCode: string;
	source: UpgradeCreditsSource;
} ) {
	const formattedAmount = formatCurrency( amount, currencyCode );
	const linkMap = { a: <InlineSupportLink supportContext="plans-upgrade-credit" /> };

	let message: React.ReactNode;
	switch ( source ) {
		case 'plan':
			message = createInterpolateElement(
				sprintf(
					/* translators: %s is a formatted currency amount, e.g. "$0.08". The <a> tags wrap a link to the upgrade credits support article. */
					__(
						'You have %s in <a>upgrade credits</a> available from your current plan. This credit will be applied to the pricing below at checkout if you upgrade today!'
					),
					formattedAmount
				),
				linkMap
			);
			break;
		case 'domain':
			message = createInterpolateElement(
				sprintf(
					/* translators: %s is a formatted currency amount, e.g. "$0.08". The <a> tags wrap a link to the upgrade credits support article. */
					__(
						'You have %s in <a>upgrade credits</a> available from your current domain. This credit will be applied to the pricing below at checkout if you purchase a plan today!'
					),
					formattedAmount
				),
				linkMap
			);
			break;
		case 'domain-and-other-upgrades':
			message = createInterpolateElement(
				sprintf(
					/* translators: %s is a formatted currency amount, e.g. "$0.08". The <a> tags wrap a link to the upgrade credits support article. */
					__(
						'You have %s in <a>upgrade credits</a> available from your current domain and other upgrades. This credit will be applied to the pricing below at checkout if you purchase a plan today!'
					),
					formattedAmount
				),
				linkMap
			);
			break;
		default: // 'other-upgrades'
			message = createInterpolateElement(
				sprintf(
					/* translators: %s is a formatted currency amount, e.g. "$0.08". The <a> tags wrap a link to the upgrade credits support article. */
					__(
						'You have %s in <a>upgrade credits</a> available from other upgrades. This credit will be applied to the pricing below at checkout if you purchase a plan today!'
					),
					formattedAmount
				),
				linkMap
			);
	}

	return (
		<div className="site-plans__upgrade-credit-notice">
			<Notice variant="success" density="high">
				{ message }
			</Notice>
		</div>
	);
}

function getBillingPeriodMonths( billPeriod: SubscriptionBillPeriodValue ): number {
	if ( billPeriod === SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD ) {
		return 1;
	}
	return Math.round( billPeriod / 365 ) * 12;
}

function getBillingPeriodLabel( billPeriod: SubscriptionBillPeriodValue ): string {
	switch ( billPeriod ) {
		case SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD:
			return __( 'Monthly' );
		case SubscriptionBillPeriod.PLAN_ANNUAL_PERIOD:
			return __( 'Yearly' );
		default: {
			const years = Math.round( billPeriod / 365 );
			if ( years <= 0 ) {
				return String( billPeriod );
			}
			return sprintf(
				/* translators: %d is the number of years, e.g. "2" */
				__( '%d Years' ),
				years
			);
		}
	}
}

function PlanPrice( {
	sitePlan,
	billingInterval,
	annualSitePlan,
}: {
	sitePlan: SiteContextualPlan;
	billingInterval: SubscriptionBillPeriodValue;
	annualSitePlan?: SiteContextualPlan;
} ) {
	const isMonthly = billingInterval === SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD;
	const billingMonths = getBillingPeriodMonths( billingInterval );

	if ( sitePlan.introductory_offer_formatted_price ) {
		const introPriceObj = getCurrencyObject(
			sitePlan.introductory_offer_raw_price ?? sitePlan.raw_price,
			sitePlan.currency_code
		);

		const originalPrice = sitePlan.raw_price + sitePlan.raw_discount;
		const regularPrice = isMonthly
			? originalPrice
			: Math.round( ( originalPrice / billingMonths ) * 100 ) / 100;
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
		let renewalNote: string;
		if ( isMonthly ) {
			renewalNote = sprintf(
				/* translators: 1: intro period (e.g. "your first month"), 2: monthly price (e.g. "$49") */
				__( 'for %1$s, then %2$s/month, excl. taxes' ),
				introPeriod,
				formattedOriginalPrice
			);
		} else if ( billingInterval === SubscriptionBillPeriod.PLAN_ANNUAL_PERIOD ) {
			renewalNote = sprintf(
				/* translators: 1: intro period (e.g. "your first month"), 2: annual price (e.g. "$588") */
				__( 'for %1$s, then %2$s billed annually, excl. taxes' ),
				introPeriod,
				formattedOriginalPrice
			);
		} else {
			const years = Math.round( billingInterval / 365 );
			renewalNote = sprintf(
				/* translators: 1: intro period (e.g. "your first month"), 2: price (e.g. "$588"), 3: number of years (e.g. "2") */
				__( 'for %1$s, then %2$s billed every %3$d years, excl. taxes' ),
				introPeriod,
				formattedOriginalPrice,
				years
			);
		}

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

	if ( ! isMonthly ) {
		const perMonthRaw = Math.round( ( originalPrice / billingMonths ) * 100 ) / 100;
		const perMonthObj = getCurrencyObject( perMonthRaw, sitePlan.currency_code );
		let billingNote: string;
		if ( billingInterval === SubscriptionBillPeriod.PLAN_ANNUAL_PERIOD ) {
			billingNote = sprintf(
				/* translators: %s is the annual price, e.g. "€251" */
				__( 'per month, %s billed annually, excl. taxes' ),
				formatCurrency( originalPrice, sitePlan.currency_code, { stripZeros: true } )
			);
		} else {
			const years = Math.round( billingInterval / 365 );
			billingNote = sprintf(
				/* translators: 1: total price (e.g. "$588"), 2: number of years (e.g. "2") */
				__( 'per month, %1$s billed every %2$d years, excl. taxes' ),
				formatCurrency( originalPrice, sitePlan.currency_code, { stripZeros: true } ),
				years
			);
		}
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
					{ billingNote }
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
	planCardName,
	tierRank,
	currentTierRank,
	redirectAfterPurchase,
	isSiteOwner,
}: {
	site: Site;
	sitePlan: SiteContextualPlan;
	planCardName: string;
	tierRank: number;
	currentTierRank: number;
	redirectAfterPurchase: string;
	isSiteOwner: boolean;
} ) {
	const { setNewMessagingChat } = useHelpCenter();
	const isCurrentPlan =
		sitePlan.current_plan === true || ( currentTierRank >= 0 && tierRank === currentTierRank );

	if ( isCurrentPlan ) {
		return (
			<Button variant="secondary" disabled className="site-plans__cta-button">
				{ __( 'Your plan' ) }
			</Button>
		);
	}

	if ( ! isSiteOwner ) {
		return null;
	}

	if ( tierRank > currentTierRank ) {
		const cancelTo = window.location.pathname + window.location.search;
		const checkoutURL = addQueryArgs(
			wpcomLink( `/checkout/${ site.slug }/${ sitePlan.product_slug }` ),
			{ redirect_to: redirectAfterPurchase, cancel_to: cancelTo }
		);
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

	return (
		<Button
			variant="secondary"
			className="site-plans__cta-button"
			onClick={ () =>
				setNewMessagingChat( {
					initialMessage: sprintf(
						/* translators: %s is the plan name, e.g. "Starter" */
						__( 'I would like to downgrade my plan to %s.' ),
						planCardName
					),
					section: 'plans',
					siteUrl: site.URL,
					siteId: String( site.ID ),
				} )
			}
		>
			{ __( 'Downgrade' ) }
		</Button>
	);
}

function PlanCard( {
	site,
	sitePlan,
	billingInterval,
	annualSitePlan,
	tierRank,
	currentTierRank,
	redirectAfterPurchase,
	totalPlanCount,
	isSiteOwner,
}: {
	site: Site;
	sitePlan: SiteContextualPlan;
	billingInterval: SubscriptionBillPeriodValue;
	annualSitePlan?: SiteContextualPlan;
	tierRank: number;
	currentTierRank: number;
	redirectAfterPurchase: string;
	totalPlanCount: number;
	isSiteOwner: boolean;
} ) {
	const isCurrentPlan =
		sitePlan.current_plan === true || ( currentTierRank >= 0 && tierRank === currentTierRank );

	// When displaying more than 2 plan cards side-by-side, the card width will
	// be small enough that badges are unlikely to fit next to the plan title,
	// causing them to wrap to the next line, which pushes the card layout off
	// compared to its neighbors. To help prevent that, we move the badge to
	// the top.
	const showBadgesAtTop = totalPlanCount > 2;

	return (
		<Card className={ `site-plans__card${ isCurrentPlan ? ' site-plans__card--current' : '' }` }>
			<CardBody>
				<div className="site-plans__badge-slot">
					{ isCurrentPlan && (
						<span className="site-plans__current-badge">{ __( 'Your plan' ) }</span>
					) }
					{ showBadgesAtTop &&
						! isCurrentPlan &&
						sitePlan.badges?.map( ( badge ) => (
							<span key={ badge } className="site-plans__plan-badge">
								{ badge }
							</span>
						) ) }
				</div>
				<VStack spacing={ 4 }>
					<VStack spacing={ 1 } className="site-plans__plan-info">
						<div className="site-plans__plan-header">
							<Text className="site-plans__plan-name" size={ 20 } weight={ 600 }>
								{ sitePlan.plan_card_name ?? sitePlan.product_name }
							</Text>
							{ ! showBadgesAtTop &&
								sitePlan.badges?.map( ( badge ) => (
									<span key={ badge } className="site-plans__plan-badge">
										{ badge }
									</span>
								) ) }
						</div>
						{ sitePlan.tagline && (
							<Text className="site-plans__tagline" variant="muted">
								{ sitePlan.tagline }
							</Text>
						) }
					</VStack>

					<VStack spacing={ 1 } className="site-plans__price-area">
						{ sitePlan.introductory_offer_formatted_price && (
							<span className="site-plans__special-offer-badge">{ __( 'Special Offer' ) }</span>
						) }
						<PlanPrice
							sitePlan={ sitePlan }
							billingInterval={ billingInterval }
							annualSitePlan={ annualSitePlan }
						/>
					</VStack>

					<PlanCardCTA
						site={ site }
						sitePlan={ sitePlan }
						planCardName={ sitePlan.plan_card_name ?? sitePlan.product_name }
						tierRank={ tierRank }
						currentTierRank={ currentTierRank }
						redirectAfterPurchase={ redirectAfterPurchase }
						isSiteOwner={ isSiteOwner }
					/>

					{ sitePlan.plan_card_features && sitePlan.plan_card_features.length > 0 && (
						<ul className="site-plans__features">
							{ sitePlan.plan_card_features.map( ( feature ) => (
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

function TierCell( {
	tier,
	tiers,
	tierValues,
	isUnavailableOnMonthly,
}: {
	tier: number;
	tiers?: number[];
	tierValues?: Record< string, string >;
	isUnavailableOnMonthly: boolean;
} ) {
	const isAvailable = ! isUnavailableOnMonthly && tiers?.includes( tier );
	if ( ! isAvailable ) {
		return <Icon icon={ lineSolid } size={ 20 } className="site-plans__comparison-dash-icon" />;
	}
	const tierValue = tierValues?.[ String( tier ) ];
	if ( tierValue ) {
		return tierValue;
	}
	return <Icon icon={ check } size={ 20 } className="site-plans__comparison-check-icon" />;
}

function BillingIntervalSelector( {
	billingInterval,
	availableBillPeriods,
	onChange,
}: {
	billingInterval: SubscriptionBillPeriodValue;
	availableBillPeriods: SubscriptionBillPeriodValue[];
	onChange: ( value: SubscriptionBillPeriodValue ) => void;
} ) {
	const handleChange = ( value: string | number | undefined ) => {
		const numeric = Number( value );
		if ( ! isNaN( numeric ) && numeric !== 0 ) {
			onChange( numeric as SubscriptionBillPeriodValue );
		}
	};

	if ( availableBillPeriods.length > 2 ) {
		return (
			<SelectControl
				value={ String( billingInterval ) }
				options={ availableBillPeriods.map( ( period ) => ( {
					value: String( period ),
					label: getBillingPeriodLabel( period ),
				} ) ) }
				onChange={ ( value ) => handleChange( value ) }
				__nextHasNoMarginBottom
				label={ __( 'Billing interval' ) }
				hideLabelFromVision
			/>
		);
	}

	return (
		<ToggleGroupControl
			value={ String( billingInterval ) }
			isBlock
			__nextHasNoMarginBottom
			__next40pxDefaultSize
			onChange={ handleChange }
			label={ __( 'Billing interval' ) }
			hideLabelFromVision
		>
			{ availableBillPeriods.map( ( period ) => (
				<ToggleGroupControlOption
					key={ period }
					value={ String( period ) }
					label={ getBillingPeriodLabel( period ) }
				/>
			) ) }
		</ToggleGroupControl>
	);
}

function PlanComparisonSection( {
	comparisonGroups,
	planColumns,
	billingInterval,
	availableBillPeriods,
	onBillingIntervalChange,
}: {
	comparisonGroups: PlanProductComparisonGroup[];
	planColumns: Array< { tierKey: number; planCardName: string | undefined } >;
	billingInterval: SubscriptionBillPeriodValue;
	availableBillPeriods: SubscriptionBillPeriodValue[];
	onBillingIntervalChange: ( value: SubscriptionBillPeriodValue ) => void;
} ) {
	return (
		<section className="site-plans__comparison">
			<div className="site-plans__comparison-header">
				<Text size={ 24 } weight={ 600 } className="site-plans__comparison-title">
					{ __( 'Compare our plans and find yours' ) }
				</Text>
				<BillingIntervalSelector
					billingInterval={ billingInterval }
					availableBillPeriods={ availableBillPeriods }
					onChange={ onBillingIntervalChange }
				/>
			</div>
			<Card className="site-plans__comparison-card">
				<table className="site-plans__comparison-table">
					<thead>
						<tr>
							<th />
							{ planColumns.map( ( col ) => (
								<th key={ col.tierKey } className="site-plans__comparison-plan-header">
									{ col.planCardName }
								</th>
							) ) }
						</tr>
					</thead>
					<tbody>
						{ comparisonGroups.map( ( group ) => (
							<Fragment key={ group.group }>
								<tr className="site-plans__comparison-group-row">
									<th colSpan={ planColumns.length + 1 }>{ group.group }</th>
								</tr>
								{ group.features.map( ( feature ) => {
									const isUnavailableOnMonthly =
										!! feature.billing_periods &&
										! feature.billing_periods.includes( billingInterval );
									return (
										<tr key={ feature.key }>
											<td className="site-plans__comparison-feature-title">{ feature.title }</td>
											{ planColumns.map( ( col ) => (
												<td key={ col.tierKey } className="site-plans__comparison-check-cell">
													<TierCell
														tier={ col.tierKey }
														tiers={ feature.tiers }
														tierValues={ feature.tier_values }
														isUnavailableOnMonthly={ isUnavailableOnMonthly }
													/>
												</td>
											) ) }
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
	const { redirect_to } = useSearch( { from: sitePlansRoute.fullPath } );
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { user } = useAuth();
	const isSiteOwner = user.ID === site.site_owner;

	const [ billingInterval, setBillingInterval ] = useState< SubscriptionBillPeriodValue >(
		SubscriptionBillPeriod.PLAN_ANNUAL_PERIOD
	);

	const backUrl = redirect_to && isRelativeUrl( redirect_to ) ? redirect_to : undefined;
	const redirectAfterPurchase = backUrl ?? dashboardLink( '/sites' );

	const { data: sitePlansData } = useQuery( {
		...sitePlansQuery( site.ID ),
		enabled: !! site.ID,
	} );
	const sitePlans = sitePlansData?.plans;
	const pageContext = sitePlansData?.pageContext;
	// Index sitePlans by product_id for O(1) sibling lookups
	const plansByProductId = new Map< number, SiteContextualPlan >(
		( sitePlans ?? [] ).map( ( p ) => [ p.product_id, p ] )
	);

	// Plans to show, sorted by plan_card_order — one entry per plan family (deduplicated by
	// product_tier_id in case multiple billing-period variants carry a plan_card_order).
	const shownPlans = ( sitePlans ?? [] )
		.filter( ( p ) => typeof p.plan_card_order === 'number' )
		.filter(
			( p, index, arr ) =>
				arr.findIndex( ( q ) => q.product_tier_id === p.product_tier_id ) === index
		)
		.sort( ( a, b ) => ( a.plan_card_order ?? 0 ) - ( b.plan_card_order ?? 0 ) );

	// Collect all billing periods available across all shown plan families, sorted ascending.
	const availableBillPeriods = Array.from(
		new Set(
			shownPlans.flatMap( ( p ) =>
				( p.product_tier_product_ids ?? [] ).flatMap( ( id ) => {
					const sp = plansByProductId.get( id );
					if ( ! sp ) {
						return [];
					}
					if ( ! sp.interval || sp.interval <= 0 ) {
						return [];
					}
					return [ sp.interval ];
				} )
			)
		)
	).sort( ( a, b ) => a - b ) as SubscriptionBillPeriodValue[];

	const activePlans = shownPlans.map( ( canonicalPlan, tierRank ) => {
		const siblings = ( canonicalPlan.product_tier_product_ids ?? [] )
			.map( ( id ) => plansByProductId.get( id ) )
			.filter( Boolean ) as SiteContextualPlan[];

		const sitePlan = siblings.find( ( p ) => p.interval === billingInterval ) ?? canonicalPlan;

		const annualSitePlan =
			billingInterval === SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD
				? siblings.find( ( p ) => p.interval === SubscriptionBillPeriod.PLAN_ANNUAL_PERIOD )
				: undefined;

		return { canonicalPlan, sitePlan, annualSitePlan, tierRank };
	} );

	// Tier rank of the current plan (by product_tier_id)
	const currentPlanSlug =
		sitePlans?.find( ( p ) => p.current_plan )?.product_slug ?? site.plan?.product_slug;
	const currentTierRank = shownPlans.findIndex( ( p ) =>
		( p.product_tier_product_ids ?? [] )
			.map( ( id ) => plansByProductId.get( id )?.product_slug )
			.includes( currentPlanSlug ?? '' )
	);

	const comparisonGroups = activePlans
		.map( ( ap ) => ap.sitePlan.features_comparison )
		.find( Boolean );

	// Comparison table columns keyed by product_tier_id, matching tiers[] in features_comparison
	const planColumns = activePlans.map( ( ap ) => ( {
		tierKey: ap.canonicalPlan.product_tier_id ?? 0,
		planCardName: ap.sitePlan.plan_card_name ?? ap.sitePlan.product_name,
	} ) );

	const upgradeCredit = getUpgradeCredit( activePlans, currentTierRank );

	return (
		<PageLayout
			header={
				<div className="site-plans__header-wrap">
					<PageHeader
						title={ pageContext?.page_title }
						prefix={
							backUrl ? (
								<Button variant="tertiary" icon={ chevronLeft } href={ backUrl } size="compact">
									{ __( 'Back' ) }
								</Button>
							) : undefined
						}
					/>
					{ pageContext?.header_message && (
						<Text className="site-plans__subheader">{ pageContext.header_message }</Text>
					) }
					{ upgradeCredit && (
						<UpgradeCreditsNotice
							amount={ upgradeCredit.amount }
							currencyCode={ upgradeCredit.currencyCode }
							source={ upgradeCredit.source }
						/>
					) }
					<div className="site-plans__interval-selector-wrap">
						<BillingIntervalSelector
							billingInterval={ billingInterval }
							availableBillPeriods={ availableBillPeriods }
							onChange={ setBillingInterval }
						/>
					</div>
				</div>
			}
		>
			<div
				className="site-plans__grid"
				style={ { '--plan-count': shownPlans.length } as React.CSSProperties }
			>
				{ activePlans.map( ( ap ) => (
					<PlanCard
						key={ String( ap.canonicalPlan.product_tier_id ) }
						site={ site }
						sitePlan={ ap.sitePlan }
						billingInterval={ billingInterval }
						annualSitePlan={ ap.annualSitePlan }
						tierRank={ ap.tierRank }
						currentTierRank={ currentTierRank }
						redirectAfterPurchase={ redirectAfterPurchase }
						totalPlanCount={ shownPlans.length }
						isSiteOwner={ isSiteOwner }
					/>
				) ) }
			</div>
			{ comparisonGroups && (
				<PlanComparisonSection
					comparisonGroups={ comparisonGroups }
					planColumns={ planColumns }
					billingInterval={ billingInterval }
					availableBillPeriods={ availableBillPeriods }
					onBillingIntervalChange={ setBillingInterval }
				/>
			) }
		</PageLayout>
	);
}
