/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { getCurrencyObject } from '@automattic/format-currency';

/**
 * Internal Dependencies
 **/
import { localize } from 'i18n-calypso';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import PlanPrice from 'calypso/my-sites/plan-price';
import PlanPill from 'calypso/components/plans/plan-pill';
import { PLANS_LIST } from 'calypso/lib/plans/plans-list';
import { getYearlyPlanByMonthly, getPlanClass } from 'calypso/lib/plans';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getPlanBySlug } from 'calypso/state/plans/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getSiteSlug } from 'calypso/state/sites/selectors';

export class PlanFeaturesComparisonHeader extends Component {
	render() {
		return this.renderPlansHeaderNoTabs();
	}

	renderPlansHeaderNoTabs() {
		const { planType, popular, selectedPlan, title, translate, rawPrice } = this.props;

		const headerClasses = classNames(
			'plan-features-comparison__header',
			getPlanClass( planType )
		);

		return (
			<span>
				<div>
					{ popular && ! selectedPlan && (
						<PlanPill isInSignup={ true }>{ translate( 'Popular' ) }</PlanPill>
					) }
				</div>
				<header className={ headerClasses }>
					<h4 className="plan-features-comparison__header-title">{ title }</h4>
				</header>
				<div className="plan-features-comparison__pricing">
					{ this.renderPriceGroup( rawPrice ) }
					{ this.getBillingTimeframe() }
					{ this.getAnnualDiscount() }
				</div>
			</span>
		);
	}

	getPerMonthDescription() {
		const {
			rawPrice,
			rawPriceAnnual,
			currencyCode,
			translate,
			annualPricePerMonth,
			isMonthlyPlan,
		} = this.props;

		if ( isMonthlyPlan && annualPricePerMonth < rawPrice ) {
			const discountRate = Math.round( ( 100 * ( rawPrice - annualPricePerMonth ) ) / rawPrice );
			return translate( `Save %(discountRate)s%% by paying annually`, { args: { discountRate } } );
		}

		if ( ! isMonthlyPlan ) {
			const annualPriceObj = getCurrencyObject( rawPriceAnnual, currencyCode );
			const annualPriceText = `${ annualPriceObj.symbol }${ annualPriceObj.integer }`;

			return translate( 'billed as %(price)s annually', {
				args: { price: annualPriceText },
			} );
		}

		return null;
	}

	getAnnualDiscount() {
		const { isMonthlyPlan, rawPriceForMonthlyPlan, annualPricePerMonth, translate } = this.props;

		if ( ! isMonthlyPlan ) {
			const discountRate = Math.round(
				( 100 * ( rawPriceForMonthlyPlan - annualPricePerMonth ) ) / rawPriceForMonthlyPlan
			);
			const annualDiscountText = translate( `You're saving %(discountRate)s%% by paying annually`, {
				args: { discountRate },
			} );

			return (
				<div className={ 'plan-features-comparison__header-annual-discount' }>
					<span>{ annualDiscountText }</span>
				</div>
			);
		}
	}

	getBillingTimeframe() {
		const { billingTimeFrame } = this.props;
		const perMonthDescription = this.getPerMonthDescription() || billingTimeFrame;

		return (
			<div className={ 'plan-features-comparison__header-billing-info' }>
				<span>{ perMonthDescription }</span>
			</div>
		);
	}

	isPlanCurrent() {
		const { planType, current, currentSitePlan } = this.props;

		if ( ! currentSitePlan ) {
			return current;
		}

		return getPlanClass( planType ) === getPlanClass( currentSitePlan.productSlug );
	}

	renderPriceGroup( fullPrice ) {
		const {
			currencyCode,
			isInSignup,
			plansWithScroll,
			isInVerticalScrollingPlansExperiment,
		} = this.props;
		const displayFlatPrice =
			isInSignup && ! plansWithScroll && ! isInVerticalScrollingPlansExperiment;

		// TODO: If the experiment wins, then we need to plan on how to show the 1st year promotional price for INR and MX
		return (
			<PlanPrice
				currencyCode={ currencyCode }
				rawPrice={ fullPrice }
				displayFlatPrice={ displayFlatPrice }
				isInSignup={ isInSignup }
			/>
		);
	}
}

PlanFeaturesComparisonHeader.propTypes = {
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
	siteSlug: PropTypes.string,
	title: PropTypes.string.isRequired,
	translate: PropTypes.func,

	// Connected props
	currentSitePlan: PropTypes.object,
	isSiteAT: PropTypes.bool,
	relatedYearlyPlan: PropTypes.object,

	// For Monthly Pricing test
	annualPricePerMonth: PropTypes.number,
};

PlanFeaturesComparisonHeader.defaultProps = {
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
} )( localize( PlanFeaturesComparisonHeader ) );
