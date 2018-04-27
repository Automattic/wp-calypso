/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { get, noop } from 'lodash';
import classNames from 'classnames';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 **/
import { localize } from 'i18n-calypso';
import formatCurrency from 'lib/format-currency';
import InfoPopover from 'components/info-popover';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import PlanPrice from 'my-sites/plan-price';
import PlanIntervalDiscount from 'my-sites/plan-interval-discount';
import Ribbon from 'components/ribbon';
import PlanIcon from 'components/plans/plan-icon';
import { TYPE_FREE, PLANS_LIST, getPlanClass } from 'lib/plans/constants';
import { getYearlyPlanByMonthly, planMatches } from 'lib/plans';
import { getCurrentPlan } from 'state/sites/plans/selectors';
import { getPlanBySlug } from 'state/plans/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { isMobile } from 'lib/viewport';
import { planLevelsMatch } from 'lib/plans/index';

export class PlanFeaturesHeader extends Component {
	render() {
		const { isInSignup } = this.props;
		let content = this.renderPlansHeader();

		if ( isInSignup ) {
			content = this.renderSignupHeader();
		}

		return content;
	}

	renderPlansHeader() {
		const { newPlan, bestValue, planType, popular, selectedPlan, title, translate } = this.props;

		const headerClasses = classNames( 'plan-features__header', getPlanClass( planType ) );

		return (
			<header className={ headerClasses } onClick={ this.props.onClick }>
				{ planLevelsMatch( selectedPlan, planType ) && (
					<Ribbon>{ translate( 'Suggested' ) }</Ribbon>
				) }
				{ popular && ! selectedPlan && <Ribbon>{ translate( 'Popular' ) }</Ribbon> }
				{ newPlan && ! selectedPlan && <Ribbon>{ translate( 'New' ) }</Ribbon> }
				{ bestValue && ! selectedPlan && <Ribbon>{ translate( 'Best Value' ) }</Ribbon> }
				{ this.isPlanCurrent() && <Ribbon>{ translate( 'Your Plan' ) }</Ribbon> }
				<div className="plan-features__header-figure">
					<PlanIcon plan={ planType } />
				</div>
				<div className="plan-features__header-text">
					<h4 className="plan-features__header-title">
						{ title }
						{ this.getCreditLabel() }
					</h4>
					{ this.getPlanFeaturesPrices() }
					{ this.getBillingTimeframe() }
				</div>
			</header>
		);
	}

	renderSignupHeader() {
		const { planType, popular, newPlan, bestValue, title, audience, translate } = this.props;

		const headerClasses = classNames( 'plan-features__header', getPlanClass( planType ) );

		return (
			<div className="plan-features__header-wrapper">
				<header className={ headerClasses } onClick={ this.props.onClick }>
					{ newPlan && <Ribbon>{ translate( 'New' ) }</Ribbon> }
					{ popular && <Ribbon>{ translate( 'Popular' ) }</Ribbon> }
					{ bestValue && <Ribbon>{ translate( 'Best Value' ) }</Ribbon> }
					<div className="plan-features__header-text">
						<h4 className="plan-features__header-title">{ title }</h4>
						{ audience }
					</div>
				</header>
				<div className="plan-features__graphic">
					<PlanIcon plan={ planType } />
				</div>
				<div className="plan-features__pricing">
					{ this.getPlanFeaturesPrices() } { this.getBillingTimeframe() }
					{ this.getIntervalDiscount() }
				</div>
			</div>
		);
	}

	getCreditLabel() {
		const {
			available,
			discountPrice,
			isJetpack,
			rawPrice,
			relatedMonthlyPlan,
			showModifiedPricingDisplay,
		} = this.props;

		if ( ! showModifiedPricingDisplay || ! available || this.isPlanCurrent() ) {
			return null;
		}

		if ( ! discountPrice && ! relatedMonthlyPlan ) {
			return null;
		}

		if ( relatedMonthlyPlan && relatedMonthlyPlan.raw_price * 12 === rawPrice ) {
			return null;
		}

		// Note: Don't make this translatable because it's only visible to English-language users
		return (
			<span className="plan-features__header-credit-label">
				{ isJetpack ? 'Discount' : 'Credit available' }
			</span>
		);
	}

	getDiscountTooltipMessage() {
		const { currencyCode, currentSitePlan, translate, rawPrice } = this.props;

		if ( planMatches( currentSitePlan.productSlug, { type: TYPE_FREE } ) ) {
			return translate( 'Price for the next 12 months' );
		}

		const price = formatCurrency( rawPrice, currencyCode );

		return translate(
			"We'll deduct the cost of your current plan from the full price (%(price)s) for the next 12 months.",
			{ args: { price } }
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
		} = this.props;

		const isDiscounted = !! discountPrice;
		const timeframeClasses = classNames( 'plan-features__header-timeframe', {
			'is-discounted': isDiscounted,
			'is-placeholder': isPlaceholder,
		} );

		if ( isInSignup ) {
			return (
				<span>
					<span>{ billingTimeFrame }</span>
				</span>
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
					{ ! isPlaceholder ? billingTimeFrame : '' }
					{ isDiscounted &&
						! isPlaceholder && (
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
			currencyCode,
			discountPrice,
			isInSignup,
			isPlaceholder,
			isJetpack,
			rawPrice,
			relatedMonthlyPlan,
			showModifiedPricingDisplay,
		} = this.props;

		if ( isPlaceholder && ! isInSignup ) {
			const classes = classNames( 'is-placeholder', {
				'plan-features__price': ! isJetpack,
				'plan-features__price-jetpack': isJetpack,
			} );

			return <div className={ classes } />;
		}

		if ( relatedMonthlyPlan ) {
			const originalPrice = relatedMonthlyPlan.raw_price * 12;
			return (
				<span className="plan-features__header-price-group">
					<PlanPrice
						currencyCode={ currencyCode }
						rawPrice={
							showModifiedPricingDisplay && this.isPlanCurrent() ? rawPrice : originalPrice
						}
						isInSignup={ isInSignup }
						original
					/>
					<PlanPrice
						currencyCode={ currencyCode }
						rawPrice={ rawPrice }
						isInSignup={ isInSignup }
						discounted
					/>
				</span>
			);
		}

		if ( discountPrice ) {
			return (
				<span className="plan-features__header-price-group">
					<PlanPrice
						currencyCode={ currencyCode }
						rawPrice={ rawPrice }
						isInSignup={ isInSignup }
						original
					/>
					<PlanPrice
						currencyCode={ currencyCode }
						rawPrice={ discountPrice }
						isInSignup={ isInSignup }
						discounted
					/>
				</span>
			);
		}

		return (
			<PlanPrice currencyCode={ currencyCode } rawPrice={ rawPrice } isInSignup={ isInSignup } />
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
	available: PropTypes.bool,
	bestValue: PropTypes.bool,
	billingTimeFrame: PropTypes.string.isRequired,
	currencyCode: PropTypes.string,
	current: PropTypes.bool,
	discountPrice: PropTypes.number,
	isInJetpackConnect: PropTypes.bool,
	isInSignup: PropTypes.bool,
	isJetpack: PropTypes.bool,
	isPlaceholder: PropTypes.bool,
	newPlan: PropTypes.bool,
	onClick: PropTypes.func,
	planType: PropTypes.oneOf( Object.keys( PLANS_LIST ) ).isRequired,
	popular: PropTypes.bool,
	rawPrice: PropTypes.number,
	relatedMonthlyPlan: PropTypes.object,
	siteSlug: PropTypes.string,
	title: PropTypes.string.isRequired,
	translate: PropTypes.func,

	// Connected props
	currentSitePlan: PropTypes.object,
	isSiteAT: PropTypes.bool,
	relatedYearlyPlan: PropTypes.object,
};

PlanFeaturesHeader.defaultProps = {
	basePlansPath: null,
	bestValue: false,
	current: false,
	currentSitePlan: {},
	isInSignup: false,
	isJetpack: false,
	isPlaceholder: false,
	isSiteAT: false,
	newPlan: false,
	onClick: noop,
	popular: false,
	siteSlug: '',
};

export default connect( ( state, { isInSignup, planType, relatedMonthlyPlan } ) => {
	const selectedSiteId = isInSignup ? null : getSelectedSiteId( state );
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
