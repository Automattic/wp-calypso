/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { noop } from 'lodash';
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
import Ribbon from 'components/ribbon';
import PlanIcon from 'components/plans/plan-icon';
import {
	PLAN_FREE,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_PERSONAL,
	getPlanClass,
} from 'lib/plans/constants';
import { getCurrentPlan } from 'state/sites/plans/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isMobile } from 'lib/viewport';
import { planLevelsMatch } from 'lib/plans/index';

class PlanFeaturesHeader extends Component {
	render() {
		const { isInSignup } = this.props;
		let content = this.renderPlansHeader();

		if ( isInSignup ) {
			content = this.renderSignupHeader();
		}

		return content;
	}

	renderPlansHeader() {
		const { newPlan, planType, popular, selectedPlan, title, translate } = this.props;

		const headerClasses = classNames( 'plan-features__header', getPlanClass( planType ) );

		return (
			<header className={ headerClasses } onClick={ this.props.onClick }>
				{ planLevelsMatch( selectedPlan, planType ) && (
					<Ribbon>{ translate( 'Suggested' ) }</Ribbon>
				) }
				{ popular && ! selectedPlan && <Ribbon>{ translate( 'Popular' ) }</Ribbon> }
				{ newPlan && ! selectedPlan && <Ribbon>{ translate( 'New' ) }</Ribbon> }
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
		const { planType, popular, newPlan, title, audience, translate } = this.props;

		const headerClasses = classNames( 'plan-features__header', getPlanClass( planType ) );

		return (
			<div className="plan-features__header-wrapper">
				<header className={ headerClasses } onClick={ this.props.onClick }>
					{ newPlan && <Ribbon>{ translate( 'New' ) }</Ribbon> }
					{ popular && <Ribbon>{ translate( 'Popular' ) }</Ribbon> }
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
				</div>
			</div>
		);
	}

	getDiscountTooltipMessage() {
		const { currencyCode, currentSitePlan, translate, rawPrice } = this.props;

		if ( currentSitePlan.productSlug === PLAN_FREE ) {
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
			site,
			isSiteAT,
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

		if ( isSiteAT || ! site.jetpack || this.props.planType === PLAN_JETPACK_FREE || hideMonthly ) {
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
			rawPrice,
			isPlaceholder,
			relatedMonthlyPlan,
			site,
			isInSignup,
		} = this.props;

		if ( isPlaceholder && ! isInSignup ) {
			const isJetpackSite = !! site.jetpack;
			const classes = classNames( 'is-placeholder', {
				'plan-features__price': ! isJetpackSite,
				'plan-features__price-jetpack': isJetpackSite,
			} );

			return <div className={ classes } />;
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

		if ( relatedMonthlyPlan ) {
			const originalPrice = relatedMonthlyPlan.raw_price * 12;
			return (
				<span className="plan-features__header-price-group">
					<PlanPrice
						currencyCode={ currencyCode }
						rawPrice={ originalPrice }
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

		return (
			<PlanPrice currencyCode={ currencyCode } rawPrice={ rawPrice } isInSignup={ isInSignup } />
		);
	}
}

PlanFeaturesHeader.propTypes = {
	billingTimeFrame: PropTypes.string.isRequired,
	current: PropTypes.bool,
	onClick: PropTypes.func,
	planType: PropTypes.oneOf( [
		PLAN_FREE,
		PLAN_PREMIUM,
		PLAN_BUSINESS,
		PLAN_JETPACK_FREE,
		PLAN_JETPACK_BUSINESS,
		PLAN_JETPACK_BUSINESS_MONTHLY,
		PLAN_JETPACK_PREMIUM,
		PLAN_JETPACK_PREMIUM_MONTHLY,
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_PERSONAL_MONTHLY,
		PLAN_PERSONAL,
	] ).isRequired,
	popular: PropTypes.bool,
	newPlan: PropTypes.bool,
	rawPrice: PropTypes.number,
	discountPrice: PropTypes.number,
	currencyCode: PropTypes.string,
	title: PropTypes.string.isRequired,
	isPlaceholder: PropTypes.bool,
	translate: PropTypes.func,
	site: PropTypes.object,
	isInJetpackConnect: PropTypes.bool,
	currentSitePlan: PropTypes.object,
	relatedMonthlyPlan: PropTypes.object,
	isSiteAT: PropTypes.bool,
};

PlanFeaturesHeader.defaultProps = {
	current: false,
	onClick: noop,
	popular: false,
	newPlan: false,
	isPlaceholder: false,
	site: {},
	basePlansPath: null,
	currentSitePlan: {},
	isSiteAT: false,
};

export default connect( ( state, ownProps ) => {
	const { isInSignup } = ownProps;
	const selectedSiteId = isInSignup ? null : getSelectedSiteId( state );
	const currentSitePlan = getCurrentPlan( state, selectedSiteId );
	return Object.assign( {}, ownProps, {
		currentSitePlan,
		isSiteAT: isSiteAutomatedTransfer( state, selectedSiteId ),
	} );
} )( localize( PlanFeaturesHeader ) );
