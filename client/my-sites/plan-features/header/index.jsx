/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import noop from 'lodash/noop';
import classNames from 'classnames';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 **/
import { localize } from 'i18n-calypso';
import Ribbon from 'components/ribbon';
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
	getPlanClass
} from 'lib/plans/constants';
import PlanIcon from 'components/plans/plan-icon';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getCurrentPlan } from 'state/sites/plans/selectors';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import Price from './price';
import Tagline from './tagline';
import TimeFrame from './time-frame';

export class PlanFeaturesHeader extends Component {
	render() {
		const {
			basePlansPath,
			billingTimeFrame,
			currencyCode,
			discountPrice,
			hideMonthly,
			isPlaceholder,
			isSiteAT,
			intervalType,
			planType,
			rawPrice,
			relatedMonthlyPlan,
			showBigPlanIcon,
			site,
			title,
		} = this.props;

		const headerClasses = classNames(
			'plan-features__header',
			getPlanClass( planType ),
			{ 'has-big-icon': showBigPlanIcon }
		);

		const priceProps = { currencyCode, discountPrice, isPlaceholder, rawPrice, relatedMonthlyPlan, site };
		const timeFrameProps = {
			basePlansPath,
			billingTimeFrame,
			discountPrice,
			hideMonthly,
			intervalType,
			isPlaceholder,
			isSiteAT,
			planType,
			rawPrice,
			site
		};

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<header className={ headerClasses } onClick={ this.props.onClick } >
				{ this.renderRibbons() }
				{ ! showBigPlanIcon && this.renderPlanIcon() }
				<div className="plan-features__header-text">
					<h4 className="plan-features__header-title">{ title }</h4>
					{ showBigPlanIcon && <Tagline planType={ planType } /> }
					{ showBigPlanIcon && this.renderPlanIcon() }
					<Price { ...priceProps } />
					<TimeFrame { ...timeFrameProps } isPlanCurrent={ this.isPlanCurrent() } />
				</div>
			</header>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}

	renderRibbons() {
		const { popular, newPlan, translate } = this.props;

		return [
			popular && <Ribbon key="popular">{ translate( 'Popular' ) }</Ribbon>,
			newPlan && <Ribbon key="new">{ translate( 'New' ) }</Ribbon>,
			this.isPlanCurrent() && <Ribbon key="current">{ translate( 'Your Plan' ) }</Ribbon>,
		];
	}

	renderPlanIcon() {
		const { showBigPlanIcon, planType } = this.props;

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<div className="plan-features__header-figure" >
				<PlanIcon plan={ planType } isBig={ showBigPlanIcon } />
			</div>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}

	isPlanCurrent() {
		const {
			planType,
			current,
			currentSitePlan
		} = this.props;

		if ( ! currentSitePlan ) {
			return current;
		}

		return getPlanClass( planType ) === getPlanClass( currentSitePlan.productSlug );
	}
}

PlanFeaturesHeader.propTypes = {
	billingTimeFrame: PropTypes.string.isRequired,
	current: PropTypes.bool,
	onClick: PropTypes.func,
	planType: React.PropTypes.oneOf( [
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
		PLAN_PERSONAL
	] ).isRequired,
	popular: PropTypes.bool,
	newPlan: PropTypes.bool,
	rawPrice: PropTypes.number,
	discountPrice: PropTypes.number,
	currencyCode: PropTypes.string,
	title: PropTypes.string.isRequired,
	isPlaceholder: PropTypes.bool,
	translate: PropTypes.func,
	intervalType: PropTypes.string,
	site: PropTypes.object,
	isInJetpackConnect: PropTypes.bool,
	currentSitePlan: PropTypes.object,
	relatedMonthlyPlan: PropTypes.object,
	isSiteAT: PropTypes.bool,
	showBigPlanIcon: PropTypes.bool,
};

PlanFeaturesHeader.defaultProps = {
	current: false,
	onClick: noop,
	popular: false,
	newPlan: false,
	isPlaceholder: false,
	intervalType: 'yearly',
	site: {},
	basePlansPath: null,
	currentSitePlan: {},
	isSiteAT: false,
	showBigPlanIcon: false,
};

export default connect( ( state, ownProps ) => {
	const { isInSignup } = ownProps;
	const selectedSiteId = isInSignup ? null : getSelectedSiteId( state );
	const currentSitePlan = getCurrentPlan( state, selectedSiteId );
	return Object.assign( {},
		ownProps,
		{
			currentSitePlan,
			isSiteAT: isSiteAutomatedTransfer( state, selectedSiteId )
		}
	);
} )( localize( PlanFeaturesHeader ) );
