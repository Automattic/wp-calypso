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
					<h4 className="plan-features__header-title">{ title }</h4>
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

	getDiscountTooltipMessage() {
		const { currencyCode, currentSitePlan, translate, rawPrice } = this.props;

		if ( planMatches( currentSitePlan.productSlug, { type: TYPE_FREE } ) ) {
			return translate( 'Price for the next 12 months' );
		}

		const price = formatCurrency( rawPrice, currencyCode );

		return translate(
			"You'll receive a discount from the full price of %(price)s because you already have a plan.",
			{ args: { price } }
		);
	}

	getBillingTimeframe() {
		const {
			currentSitePlan,
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

		const isUserCurrentlyOnAFreePlan =
			currentSitePlan && planMatches( currentSitePlan.productSlug, { type: TYPE_FREE } );
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
						! isUserCurrentlyOnAFreePlan &&
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
			availableForPurchase,
			isInSignup,
			isPlaceholder,
			isJetpack,
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
			if ( relatedMonthlyPlan ) {
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
		const { currencyCode, isInSignup } = this.props;

		if ( fullPrice && discountedPrice ) {
			return (
				<span className="plan-features__header-price-group">
					<div className="plan-features__header-price-group-prices">
						<PlanPrice
							currencyCode={ currencyCode }
							rawPrice={ fullPrice }
							isInSignup={ isInSignup }
							original
						/>
						<PlanPrice
							currencyCode={ currencyCode }
							rawPrice={ discountedPrice }
							isInSignup={ isInSignup }
							discounted
						/>
					</div>
					{ this.renderCreditLabel() }
				</span>
			);
		}

		return (
			<PlanPrice currencyCode={ currencyCode } rawPrice={ fullPrice } isInSignup={ isInSignup } />
		);
	}

	renderCreditLabel() {
		const {
			availableForPurchase,
			currentSitePlan,
			discountPrice,
			isJetpack,
			planType,
			rawPrice,
			showPlanCreditsApplied,
			translate,
		} = this.props;

		if (
			! showPlanCreditsApplied ||
			! availableForPurchase ||
			planMatches( planType, { type: TYPE_FREE } ) ||
			planType === currentSitePlan.productSlug ||
			isJetpack ||
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
	showPlanCreditsApplied: PropTypes.bool,
	siteSlug: PropTypes.string,
	title: PropTypes.string.isRequired,
	translate: PropTypes.func,

	// Connected props
	currentSitePlan: PropTypes.object,
	isSiteAT: PropTypes.bool,
	relatedYearlyPlan: PropTypes.object,
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
	onClick: noop,
	popular: false,
	showPlanCreditsApplied: false,
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
