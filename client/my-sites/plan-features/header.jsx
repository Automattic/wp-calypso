/**
 * External dependencies
 */
import { isMobile } from '@automattic/viewport';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { get } from 'lodash';
import classNames from 'classnames';
import { connect } from 'react-redux';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal Dependencies
 **/
import { ProductIcon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import InfoPopover from 'calypso/components/info-popover';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import PlanPrice from 'calypso/my-sites/plan-price';
import PlanIntervalDiscount from 'calypso/my-sites/plan-interval-discount';
import PlanPill from 'calypso/components/plans/plan-pill';
import { TYPE_FREE, GROUP_WPCOM, TERM_ANNUALLY } from 'calypso/lib/plans/constants';
import { PLANS_LIST } from 'calypso/lib/plans/plans-list';
import { getYearlyPlanByMonthly, planMatches, getPlanClass, isFreePlan } from 'calypso/lib/plans';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getPlanBySlug } from 'calypso/state/plans/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { planLevelsMatch } from 'calypso/lib/plans/index';

export class PlanFeaturesHeader extends Component {
	render() {
		const { isInSignup, plansWithScroll } = this.props;
		// Do not use the signup-specific header, unify plans for the plansWithScroll test
		if ( plansWithScroll ) {
			return this.renderPlansHeaderNoTabs();
		} else if ( isInSignup ) {
			return this.renderSignupHeader();
		}

		return this.renderPlansHeader();
	}

	renderPlansHeader() {
		const {
			newPlan,
			bestValue,
			planType,
			popular,
			selectedPlan,
			isInSignup,
			title,
			translate,
		} = this.props;

		const headerClasses = classNames( 'plan-features__header', getPlanClass( planType ) );
		const isCurrent = this.isPlanCurrent();

		return (
			<header className={ headerClasses }>
				<div className="plan-features__header-figure">
					<ProductIcon slug={ planType } />
				</div>
				<div className="plan-features__header-text">
					<h4 className="plan-features__header-title">{ title }</h4>
					{ this.getPlanFeaturesPrices() }
					{ this.getBillingTimeframe() }
				</div>
				{ ! isInSignup && isCurrent && <PlanPill>{ translate( 'Your Plan' ) }</PlanPill> }
				{ planLevelsMatch( selectedPlan, planType ) && ! isCurrent && (
					<PlanPill>{ translate( 'Suggested' ) }</PlanPill>
				) }
				{ popular && ! selectedPlan && ! isCurrent && (
					<PlanPill>{ translate( 'Popular' ) }</PlanPill>
				) }
				{ newPlan && ! selectedPlan && ! isCurrent && <PlanPill>{ translate( 'New' ) }</PlanPill> }
				{ bestValue && ! selectedPlan && ! isCurrent && (
					<PlanPill>{ translate( 'Best Value' ) }</PlanPill>
				) }
			</header>
		);
	}

	renderPlansHeaderNoTabs() {
		const {
			newPlan,
			bestValue,
			planType,
			popular,
			selectedPlan,
			title,
			audience,
			translate,
		} = this.props;

		const headerClasses = classNames( 'plan-features__header', getPlanClass( planType ) );

		return (
			<span>
				<header className={ headerClasses }>
					<h4 className="plan-features__header-title">{ title }</h4>
					<div className="plan-features__audience">{ audience }</div>
					{ planLevelsMatch( selectedPlan, planType ) && (
						<PlanPill>{ translate( 'Suggested' ) }</PlanPill>
					) }
					{ popular && ! selectedPlan && <PlanPill>{ translate( 'Popular' ) }</PlanPill> }
					{ newPlan && ! selectedPlan && <PlanPill>{ translate( 'New' ) }</PlanPill> }
					{ bestValue && ! selectedPlan && <PlanPill>{ translate( 'Best Value' ) }</PlanPill> }
				</header>
				<div className="plan-features__pricing">
					{ this.getPlanFeaturesPrices() } { this.getBillingTimeframe() }
					{ this.getIntervalDiscount() }
				</div>
			</span>
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

		if ( planMatches( currentSitePlan.productSlug, { type: TYPE_FREE } ) ) {
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

	getPerMonthDescription() {
		const {
			discountPrice,
			rawPrice,
			translate,
			planType,
			currentSitePlan,
			annualPricePerMonth,
			isMonthlyPricingTest,
			isMonthlyPlan,
		} = this.props;

		if ( isMonthlyPricingTest && isMonthlyPlan && annualPricePerMonth < rawPrice ) {
			const discountRate = Math.round( ( 100 * ( rawPrice - annualPricePerMonth ) ) / rawPrice );
			return translate( `Save %(discountRate)s%% by paying annually`, { args: { discountRate } } );
		}

		if ( isMonthlyPricingTest && ! isMonthlyPlan ) {
			return translate( 'billed annually' );
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
		} = this.props;

		const isDiscounted = !! discountPrice;
		const timeframeClasses = classNames( 'plan-features__header-timeframe', {
			'is-discounted': isDiscounted,
			'is-placeholder': isPlaceholder,
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
					{ isDiscounted && ! isPlaceholder && (
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
		const { planType, current, currentSitePlan } = this.props;

		if ( ! currentSitePlan ) {
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
		} = this.props;

		if ( isPlaceholder && ! isInSignup ) {
			const classes = classNames( 'is-placeholder', {
				'plan-features__price': ! isJetpack,
				'plan-features__price-jetpack': isJetpack,
			} );

			return <div className={ classes } />;
		}

		if ( availableForPurchase ) {
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

		return this.renderPriceGroup( rawPrice );
	}

	renderPriceGroup( fullPrice, discountedPrice = null ) {
		const { currencyCode, isInSignup, isMonthlyPricingTest, plansWithScroll } = this.props;
		const displayFlatPrice = isInSignup && ! plansWithScroll;

		if ( fullPrice && discountedPrice ) {
			return (
				<span className="plan-features__header-price-group">
					<div className="plan-features__header-price-group-prices">
						<PlanPrice
							currencyCode={ currencyCode }
							rawPrice={ fullPrice }
							isInSignup={ displayFlatPrice }
							original
						/>
						<PlanPrice
							currencyCode={ currencyCode }
							rawPrice={ discountedPrice }
							isInSignup={ displayFlatPrice }
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
				isInSignup={ displayFlatPrice }
				isMonthlyPricingTest={ isMonthlyPricingTest }
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

	// For Monthly Pricing test
	annualPricePerMonth: PropTypes.number,
	isMonthlyPricingTest: PropTypes.bool,
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
	isMonthlyPricingTest: false,
};

export default connect( ( state, { planType, relatedMonthlyPlan } ) => {
	const selectedSiteId = getSelectedSiteId( state );
	const currentSitePlan = getCurrentPlan( state, selectedSiteId );
	const isYearly = !! relatedMonthlyPlan;

	return {
		currentSitePlan,
		isSiteAT: isSiteAutomatedTransfer( state, selectedSiteId ),
		isYearly,
		relatedYearlyPlan: isYearly ? null : getPlanBySlug( state, getYearlyPlanByMonthly( planType ) ),
		siteSlug: getSiteSlug( state, selectedSiteId ),
	};
} )( localize( PlanFeaturesHeader ) );
