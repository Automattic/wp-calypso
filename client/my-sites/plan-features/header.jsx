import {
	getPlans,
	getYearlyPlanByMonthly,
	planMatches,
	getPlanClass,
	isFreePlan,
	planLevelsMatch,
	TYPE_FREE,
	GROUP_WPCOM,
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	PLAN_P2_FREE,
	PLAN_P2_PLUS,
} from '@automattic/calypso-products';
import { ProductIcon } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { isMobile } from '@automattic/viewport';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import InfoPopover from 'calypso/components/info-popover';
import PlanPill from 'calypso/components/plans/plan-pill';
import PlanIntervalDiscount from 'calypso/my-sites/plan-interval-discount';
import PlanPrice from 'calypso/my-sites/plan-price';
import { getPlanBySlug } from 'calypso/state/plans/selectors';
import isEligibleForWpComMonthlyPlan from 'calypso/state/selectors/is-eligible-for-wpcom-monthly-plan';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const PLANS_LIST = getPlans();

export class PlanFeaturesHeader extends Component {
	render() {
		const {
			isInSignup,
			plansWithScroll,
			planType,
			isInVerticalScrollingPlansExperiment,
		} = this.props;

		if ( planType === PLAN_P2_FREE ) {
			return this.renderPlansHeaderP2Free();
		}

		// Do not use the signup-specific header, unify plans for the plansWithScroll test
		if ( plansWithScroll ) {
			return this.renderPlansHeaderNoTabs();
		} else if ( isInSignup ) {
			if ( isInVerticalScrollingPlansExperiment ) {
				return this.renderPlansHeaderNoTabs();
			}
			return this.renderSignupHeader();
		}
		return this.renderPlansHeader();
	}

	resolveIsPillInCorner() {
		const { isInSignup, isInVerticalScrollingPlansExperiment, plansWithScroll } = this.props;
		return (
			( isInVerticalScrollingPlansExperiment && isInSignup && plansWithScroll ) ||
			( ! isInVerticalScrollingPlansExperiment && isInSignup )
		);
	}

	renderPlansHeader() {
		const {
			availableForPurchase,
			newPlan,
			bestValue,
			planType,
			popular,
			selectedPlan,
			isInSignup,
			title,
			translate,
		} = this.props;

		const headerClasses = classNames( 'plan-features__header', getPlanClass( planType ), {
			'is-p2-plus': planType === PLAN_P2_PLUS,
		} );
		const isCurrent = this.isPlanCurrent();

		return (
			<header className={ headerClasses }>
				{ planType !== PLAN_P2_PLUS && (
					<div className="plan-features__header-figure">
						<ProductIcon slug={ planType } />
					</div>
				) }
				<div className="plan-features__header-text">
					<h4 className="plan-features__header-title">{ title }</h4>
					{ this.getPlanFeaturesPrices() }
					{ this.getAnnualDiscount() }
					{ this.getBillingTimeframe() }
				</div>
				{ ! isInSignup && isCurrent && (
					<PlanPill isInSignup={ isInSignup }>{ translate( 'Your Plan' ) }</PlanPill>
				) }
				{ planLevelsMatch( selectedPlan, planType ) && ! isCurrent && availableForPurchase && (
					<PlanPill isInSignup={ isInSignup }>{ translate( 'Suggested' ) }</PlanPill>
				) }
				{ popular && ! selectedPlan && ! isCurrent && (
					<PlanPill isInSignup={ isInSignup }>{ translate( 'Popular' ) }</PlanPill>
				) }
				{ newPlan && ! selectedPlan && ! isCurrent && (
					<PlanPill isInSignup={ isInSignup }>{ translate( 'New' ) }</PlanPill>
				) }
				{ bestValue && ! selectedPlan && ! isCurrent && (
					<PlanPill isInSignup={ isInSignup }>{ translate( 'Best Value' ) }</PlanPill>
				) }
			</header>
		);
	}

	renderPlansHeaderNoTabs() {
		const {
			availableForPurchase,
			newPlan,
			bestValue,
			planType,
			popular,
			selectedPlan,
			title,
			audience,
			translate,
			isBillingWordingExperiment,
		} = this.props;

		const headerClasses = classNames( 'plan-features__header', getPlanClass( planType ) );
		const isPillInCorner = this.resolveIsPillInCorner();

		return (
			<span>
				<header className={ headerClasses }>
					<h4 className="plan-features__header-title">{ title }</h4>
					<div className="plan-features__audience">{ audience }</div>
					{ planLevelsMatch( selectedPlan, planType ) && availableForPurchase && (
						<PlanPill isInSignup={ isPillInCorner }>{ translate( 'Suggested' ) }</PlanPill>
					) }
					{ popular && ! selectedPlan && (
						<PlanPill isInSignup={ isPillInCorner }>{ translate( 'Popular' ) }</PlanPill>
					) }
					{ newPlan && ! selectedPlan && (
						<PlanPill isInSignup={ isPillInCorner }>{ translate( 'New' ) }</PlanPill>
					) }
					{ bestValue && ! selectedPlan && (
						<PlanPill isInSignup={ isPillInCorner }>{ translate( 'Best Value' ) }</PlanPill>
					) }
				</header>
				<div className="plan-features__pricing">
					{ this.getPlanFeaturesPrices() } { this.getBillingTimeframe() }
					{ isBillingWordingExperiment && this.getDiscountInfo() }
					{ this.getIntervalDiscount() }
				</div>
			</span>
		);
	}

	renderPlansHeaderP2Free() {
		const { planType, isInSignup, translate } = this.props;

		const headerClasses = classNames( 'plan-features__header', getPlanClass( planType ), {
			'is-p2-free': true,
		} );
		const isCurrent = this.isPlanCurrent();

		return (
			<header className={ headerClasses }>
				<div className="plan-features__header-text">
					<h4 className="plan-features__header-title">P2</h4>
					<h4 className="plan-features__header-title-free">{ translate( 'Free' ) }</h4>
				</div>
				{ ! isInSignup && isCurrent && <PlanPill>{ translate( 'Your Plan' ) }</PlanPill> }
			</header>
		);
	}

	renderSignupHeader() {
		const { planType, popular, newPlan, bestValue, title, audience, translate } = this.props;

		const headerClasses = classNames( 'plan-features__header', getPlanClass( planType ) );

		return (
			<div className="plan-features__header-wrapper">
				<header className={ headerClasses }>
					<div className="plan-features__header-text">
						<h4 className="plan-features__header-title">{ title }</h4>
						{ audience }
					</div>
					{ newPlan && <PlanPill>{ translate( 'New' ) }</PlanPill> }
					{ popular && <PlanPill>{ translate( 'Popular' ) }</PlanPill> }
					{ bestValue && <PlanPill>{ translate( 'Best Value' ) }</PlanPill> }
				</header>
				<div className="plan-features__graphic">
					<ProductIcon slug={ planType } />
				</div>
				<div className="plan-features__pricing">
					{ this.getPlanFeaturesPrices() } { this.getBillingTimeframe() }
					{ this.getIntervalDiscount() }
				</div>
			</div>
		);
	}

	getDiscountTooltipMessage() {
		const { currencyCode, currentSitePlan, translate, rawPrice, discountPrice } = this.props;
		const price = formatCurrency( rawPrice, currencyCode );
		const isDiscounted = !! discountPrice;

		if ( planMatches( currentSitePlan?.productSlug, { type: TYPE_FREE } ) ) {
			return isDiscounted
				? translate(
						"You'll receive a discount for the first year. The plan will renew at %(price)s.",
						{ args: { price } }
				  )
				: translate( 'Price for the next 12 months' );
		}

		return translate(
			"You'll receive a discount from the full price of %(price)s because you already have a plan.",
			{ args: { price } }
		);
	}

	getAnnualDiscount() {
		const {
			isMonthlyPlan,
			translate,
			relatedMonthlyPlan,
			relatedYearlyPlan,
			eligibleForWpcomMonthlyPlans,
		} = this.props;

		if (
			isMonthlyPlan ||
			! relatedMonthlyPlan ||
			! eligibleForWpcomMonthlyPlans ||
			! relatedYearlyPlan
		) {
			return;
		}

		const rawPrice = relatedMonthlyPlan.raw_price;

		const annualPricePerMonth = relatedYearlyPlan.raw_price / 12;
		const discountRate = Math.round( ( 100 * ( rawPrice - annualPricePerMonth ) ) / rawPrice );

		const isLoading = typeof rawPrice !== 'number';
		const annualDiscountText = translate( `You're saving %(discountRate)s%% by paying annually`, {
			args: { discountRate },
		} );

		return (
			<div
				className={ classNames( {
					'plan-features__header-annual-discount': true,
					'plan-features__header-annual-discount-is-loading': isLoading,
				} ) }
			>
				<span>{ annualDiscountText }</span>
			</div>
		);
	}

	getPerMonthDescription() {
		const {
			discountPrice,
			rawPrice,
			translate,
			planType,
			currentSitePlan,
			isInSignup,
			isMonthlyPlan,
			relatedYearlyPlan,
			isLoggedInMonthlyPricing,
			isBillingWordingExperiment,
		} = this.props;

		if ( ( isInSignup || isLoggedInMonthlyPricing ) && isMonthlyPlan && relatedYearlyPlan ) {
			const annualPricePerMonth = relatedYearlyPlan.raw_price / 12;
			const discountRate = Math.round( ( 100 * ( rawPrice - annualPricePerMonth ) ) / rawPrice );
			return translate( `Save %(discountRate)s%% by paying annually`, { args: { discountRate } } );
		}

		if (
			( isInSignup || isLoggedInMonthlyPricing ) &&
			! isMonthlyPlan &&
			planMatches( planType, { group: GROUP_WPCOM, term: TERM_ANNUALLY } ) &&
			relatedYearlyPlan
		) {
			if ( isBillingWordingExperiment ) {
				return translate( 'billed as %(price)s annually', {
					args: { price: relatedYearlyPlan.formatted_price },
				} );
			}
			return translate( 'billed annually' );
		}

		if (
			( isInSignup || isLoggedInMonthlyPricing ) &&
			! isMonthlyPlan &&
			planMatches( planType, { group: GROUP_WPCOM, term: TERM_BIENNIALLY } )
		) {
			return translate( 'billed every two years' );
		}

		if ( typeof discountPrice !== 'number' || typeof rawPrice !== 'number' ) {
			return null;
		}
		if ( ! planMatches( planType, { group: GROUP_WPCOM, term: TERM_ANNUALLY } ) ) {
			return null;
		}
		if ( ! currentSitePlan || ! isFreePlan( currentSitePlan.productSlug ) ) {
			return null;
		}

		const discountPercent = Math.round( ( 100 * ( rawPrice - discountPrice ) ) / rawPrice );
		if ( discountPercent <= 0 ) {
			return null;
		}

		return translate(
			'Save %(discountPercent)s%% for 12 months!{{br/}} Per month, billed yearly.',
			{
				args: { discountPercent },
				components: { br: <br /> },
			}
		);
	}

	getDiscountInfo() {
		const { translate, relatedYearlyPlan, relatedMonthlyPlan, isYearly } = this.props;

		if ( isYearly && relatedMonthlyPlan && relatedYearlyPlan ) {
			const annualPricePerMonth = relatedYearlyPlan.raw_price / 12;
			const discountRate = Math.round(
				( 100 * ( relatedMonthlyPlan.raw_price - annualPricePerMonth ) ) /
					relatedMonthlyPlan.raw_price
			);
			const annualDiscountText = translate( `You're saving %(discountRate)s%% by paying annually`, {
				args: { discountRate },
			} );

			return <div className="plan-features__header-discounted-info">{ annualDiscountText }</div>;
		}
		return null;
	}

	getBillingTimeframe() {
		const {
			billingTimeFrame,
			discountPrice,
			isPlaceholder,
			isSiteAT,
			isJetpack,
			hideMonthly,
			isInSignup,
			plansWithScroll,
			isLoggedInMonthlyPricing,
			isMonthlyPlan,
		} = this.props;

		const isDiscounted = !! discountPrice;
		const timeframeClasses = classNames( 'plan-features__header-timeframe', {
			'is-discounted': isDiscounted,
			'is-placeholder': isPlaceholder,
			'is-logged-in-monthly-pricing': isLoggedInMonthlyPricing,
		} );
		const perMonthDescription = this.getPerMonthDescription() || billingTimeFrame;
		if ( isInSignup || plansWithScroll ) {
			return (
				<div className={ 'plan-features__header-billing-info' }>
					<span>{ perMonthDescription }</span>
				</div>
			);
		}

		if (
			isSiteAT ||
			! isJetpack ||
			planMatches( this.props.planType, { type: TYPE_FREE } ) ||
			hideMonthly
		) {
			return (
				<p className={ timeframeClasses }>
					{ ! isPlaceholder ? perMonthDescription : '' }
					{ isDiscounted && ! isPlaceholder && ! isMonthlyPlan && (
						<InfoPopover
							className="plan-features__header-tip-info"
							position={ isMobile() ? 'top' : 'bottom left' }
						>
							{ this.getDiscountTooltipMessage() }
						</InfoPopover>
					) }
				</p>
			);
		}

		return <p className={ timeframeClasses }>{ billingTimeFrame }</p>;
	}

	isPlanCurrent() {
		const { planType, current, currentSitePlan, isLoggedInMonthlyPricing, isJetpack } = this.props;

		if ( ! currentSitePlan || ( isLoggedInMonthlyPricing && ! isJetpack ) ) {
			return current;
		}

		return getPlanClass( planType ) === getPlanClass( currentSitePlan.productSlug );
	}

	getPlanFeaturesPrices() {
		const {
			availableForPurchase,
			isInSignup,
			isPlaceholder,
			isJetpack,
			isSiteAT,
			discountPrice,
			rawPrice,
			relatedMonthlyPlan,
			isFirstYearPromotionalDiscount,
			isLoggedInMonthlyPricing,
		} = this.props;

		if ( isPlaceholder && ! isInSignup ) {
			const classes = classNames( 'is-placeholder', {
				'plan-features__price': ! isJetpack,
				'plan-features__price-jetpack': isJetpack,
			} );

			return <div className={ classes } />;
		}

		if ( availableForPurchase && ! isLoggedInMonthlyPricing ) {
			// Only multiply price by 12 for Jetpack plans where we sell both monthly and yearly
			if ( isJetpack && ! isSiteAT && relatedMonthlyPlan ) {
				return this.renderPriceGroup(
					relatedMonthlyPlan.raw_price * 12,
					discountPrice || rawPrice
				);
			} else if ( discountPrice ) {
				return this.renderPriceGroup( rawPrice, discountPrice );
			}
		}

		if ( isFirstYearPromotionalDiscount ) {
			return this.renderPriceGroup( rawPrice, discountPrice );
		}
		return this.renderPriceGroup( rawPrice );
	}

	renderPriceGroup( fullPrice, discountedPrice = null ) {
		const {
			currencyCode,
			isInSignup,
			plansWithScroll,
			isInVerticalScrollingPlansExperiment,
			isLoggedInMonthlyPricing,
		} = this.props;
		const displayFlatPrice =
			isInSignup && ! plansWithScroll && ! isInVerticalScrollingPlansExperiment;

		if ( fullPrice && discountedPrice ) {
			return (
				<span className="plan-features__header-price-group">
					<div className="plan-features__header-price-group-prices">
						<PlanPrice
							currencyCode={ currencyCode }
							rawPrice={ fullPrice }
							displayFlatPrice={ displayFlatPrice }
							displayPerMonthNotation={ true }
							original
						/>
						<PlanPrice
							currencyCode={ currencyCode }
							rawPrice={ discountedPrice }
							displayFlatPrice={ displayFlatPrice }
							displayPerMonthNotation={ true }
							discounted
						/>
					</div>
					{ plansWithScroll ? null : this.renderCreditLabel() }
				</span>
			);
		}

		return (
			<PlanPrice
				currencyCode={ currencyCode }
				rawPrice={ fullPrice }
				displayFlatPrice={ displayFlatPrice }
				displayPerMonthNotation={ isInSignup || isLoggedInMonthlyPricing }
			/>
		);
	}

	renderCreditLabel() {
		const {
			availableForPurchase,
			currentSitePlan,
			discountPrice,
			isJetpack,
			isSiteAT,
			planType,
			rawPrice,
			showPlanCreditsApplied,
			translate,
		} = this.props;

		const isJetpackNotAtomic = isJetpack && ! isSiteAT;

		if (
			! showPlanCreditsApplied ||
			! availableForPurchase ||
			planMatches( planType, { type: TYPE_FREE } ) ||
			planType === currentSitePlan.productSlug ||
			isJetpackNotAtomic ||
			! discountPrice ||
			discountPrice >= rawPrice
		) {
			return null;
		}

		return (
			<span className="plan-features__header-credit-label">{ translate( 'Credit applied' ) }</span>
		);
	}

	getIntervalDiscount() {
		const {
			basePlansPath,
			currencyCode,
			isJetpack,
			isSiteAT,
			isYearly,
			rawPrice,
			relatedMonthlyPlan,
			relatedYearlyPlan,
			siteSlug,
		} = this.props;
		if ( isJetpack && ! isSiteAT ) {
			const [ discountPrice, originalPrice ] = isYearly
				? [ relatedMonthlyPlan.raw_price * 12, rawPrice ]
				: [ rawPrice * 12, get( relatedYearlyPlan, 'raw_price' ) ];

			return (
				!! discountPrice &&
				!! originalPrice && (
					<PlanIntervalDiscount
						basePlansPath={ basePlansPath }
						currencyCode={ currencyCode }
						discountPrice={ discountPrice }
						isYearly={ isYearly }
						originalPrice={ originalPrice }
						siteSlug={ siteSlug }
					/>
				)
			);
		}

		return null;
	}
}

PlanFeaturesHeader.propTypes = {
	availableForPurchase: PropTypes.bool,
	bestValue: PropTypes.bool,
	billingTimeFrame: PropTypes.oneOfType( [ PropTypes.string, PropTypes.array ] ).isRequired,
	currencyCode: PropTypes.string,
	current: PropTypes.bool,
	discountPrice: PropTypes.number,
	isInJetpackConnect: PropTypes.bool,
	isInSignup: PropTypes.bool,
	isJetpack: PropTypes.bool,
	isPlaceholder: PropTypes.bool,
	newPlan: PropTypes.bool,
	planType: PropTypes.oneOf( Object.keys( PLANS_LIST ) ).isRequired,
	popular: PropTypes.bool,
	rawPrice: PropTypes.number,
	relatedMonthlyPlan: PropTypes.object,
	showPlanCreditsApplied: PropTypes.bool,
	siteSlug: PropTypes.string,
	title: PropTypes.string.isRequired,
	translate: PropTypes.func,

	// Connected props
	currentSitePlan: PropTypes.object,
	isSiteAT: PropTypes.bool,
	relatedYearlyPlan: PropTypes.object,

	isLoggedInMonthlyPricing: PropTypes.bool,
	eligibleForWpcomMonthlyPlans: PropTypes.bool,
};

PlanFeaturesHeader.defaultProps = {
	availableForPurchase: true,
	basePlansPath: null,
	bestValue: false,
	current: false,
	currentSitePlan: {},
	isInSignup: false,
	isJetpack: false,
	isPlaceholder: false,
	isSiteAT: false,
	newPlan: false,
	popular: false,
	showPlanCreditsApplied: false,
	siteSlug: '',
	isLoggedInMonthlyPricing: false,
	eligibleForWpcomMonthlyPlans: false,
};

export default connect( ( state, { planType, relatedMonthlyPlan } ) => {
	const selectedSiteId = getSelectedSiteId( state );
	const currentSitePlan = getCurrentPlan( state, selectedSiteId );
	const isYearly = !! relatedMonthlyPlan;
	const relatedYearlyPlan = getPlanBySlug( state, getYearlyPlanByMonthly( planType ) );

	const isFirstYearPromotionalDiscount =
		isYearly &&
		relatedYearlyPlan &&
		'first_year_promotional_discounts' === relatedYearlyPlan.overridden_price_reason;

	return {
		currentSitePlan,
		isSiteAT: isSiteAutomatedTransfer( state, selectedSiteId ),
		isYearly,
		isFirstYearPromotionalDiscount,
		relatedYearlyPlan,
		siteSlug: getSiteSlug( state, selectedSiteId ),
		eligibleForWpcomMonthlyPlans: isEligibleForWpComMonthlyPlan( state, selectedSiteId ),
	};
} )( localize( PlanFeaturesHeader ) );
