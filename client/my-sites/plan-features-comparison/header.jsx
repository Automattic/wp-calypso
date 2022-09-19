import {
	getPlans,
	getPlanClass,
	PLAN_BUSINESS,
	PLAN_BUSINESS_MONTHLY,
} from '@automattic/calypso-products';
import { getCurrencyObject } from '@automattic/format-currency';
import { NEWSLETTER_FLOW, LINK_IN_BIO_FLOW } from '@automattic/onboarding';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import PlanPill from 'calypso/components/plans/plan-pill';
import PlanPrice from 'calypso/my-sites/plan-price';
import { getCurrentFlowName } from 'calypso/state/signup/flow/selectors';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const PLANS_LIST = getPlans();

export class PlanFeaturesComparisonHeader extends Component {
	render() {
		const { isInMarketplace } = this.props;
		if ( isInMarketplace ) {
			return this.renderPlanHeaderMarketplace();
		}
		return this.renderPlansHeaderNoTabs();
	}

	getPlanPillText() {
		const { flow, translate } = this.props;

		switch ( flow ) {
			case NEWSLETTER_FLOW:
				return translate( 'Best for Newsletters' );
			case LINK_IN_BIO_FLOW:
				return translate( 'Best for Link in Bio' );
			default:
				return translate( 'Popular' );
		}
	}

	renderPlansHeaderNoTabs() {
		const { planType, popular, selectedPlan, title } = this.props;

		const headerClasses = classNames(
			'plan-features-comparison__header',
			getPlanClass( planType )
		);

		return (
			<span>
				<div>
					{ popular && ! selectedPlan && (
						<PlanPill isInSignup={ true }>{ this.getPlanPillText() }</PlanPill>
					) }
				</div>
				<header className={ headerClasses }>
					<h4 className="plan-features-comparison__header-title">{ title }</h4>
				</header>
				<div className="plan-features-comparison__pricing">
					{ this.renderPriceGroup() }
					{ this.getBillingTimeframe() }
				</div>
				{ this.getAnnualDiscount() }
			</span>
		);
	}

	renderPlanHeaderMarketplace() {
		const { planType, title, translate, current } = this.props;

		const headerClasses = classNames(
			'plan-features-comparison__header',
			getPlanClass( planType )
		);

		return (
			<span>
				{ current && (
					<PlanPill isInMarketplace backgroundColor="#DCDCDE" color="var(--studio-gray-70)">
						{ translate( 'Your current plan' ) }
					</PlanPill>
				) }
				{ ( planType === PLAN_BUSINESS || planType === PLAN_BUSINESS_MONTHLY ) && (
					<PlanPill
						isInMarketplace
						backgroundColor="var(--studio-green-5)"
						color="var(--studio-green-80)"
					>
						{ translate( 'Ideal for you' ) }
					</PlanPill>
				) }
				<header className={ headerClasses }>
					<h4 className="plan-features-comparison__header-title">{ title }</h4>
				</header>
				<div className="plan-features-comparison__pricing">
					{ this.renderPriceGroup() }
					{ this.getBillingTimeframe() }
				</div>
				{ ! current && this.getAnnualDiscount() }
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
			const isLoading = typeof rawPriceForMonthlyPlan !== 'number';

			const discountRate = Math.round(
				( 100 * ( rawPriceForMonthlyPlan - annualPricePerMonth ) ) / rawPriceForMonthlyPlan
			);
			const annualDiscountText = translate( `You're saving %(discountRate)s%% by paying annually`, {
				args: { discountRate },
			} );

			return (
				<div
					className={ classNames( {
						'plan-features-comparison__header-annual-discount': true,
						'plan-features-comparison__header-annual-discount-is-loading': isLoading,
					} ) }
				>
					<span>{ annualDiscountText }</span>
				</div>
			);
		}
	}

	getBillingTimeframe() {
		const { billingTimeFrame } = this.props;
		const perMonthDescription = this.getPerMonthDescription() || billingTimeFrame;

		return (
			<div className="plan-features-comparison__header-billing-info">
				<span>{ perMonthDescription }</span>
			</div>
		);
	}

	renderPriceGroup() {
		const { currencyCode, rawPrice, discountPrice } = this.props;

		if ( discountPrice ) {
			return (
				<span className="plan-features-comparison__header-price-group">
					<div className="plan-features-comparison__header-price-group-prices">
						<PlanPrice
							currencyCode={ currencyCode }
							rawPrice={ rawPrice }
							displayPerMonthNotation={ true }
							original
						/>
						<PlanPrice
							currencyCode={ currencyCode }
							rawPrice={ discountPrice }
							displayPerMonthNotation={ true }
							discounted
						/>
					</div>
				</span>
			);
		}

		return (
			<PlanPrice
				currencyCode={ currencyCode }
				rawPrice={ rawPrice }
				displayPerMonthNotation={ true }
			/>
		);
	}
}

PlanFeaturesComparisonHeader.propTypes = {
	billingTimeFrame: PropTypes.oneOfType( [ PropTypes.string, PropTypes.array ] ),
	currencyCode: PropTypes.string,
	discountPrice: PropTypes.number,
	planType: PropTypes.oneOf( Object.keys( PLANS_LIST ) ).isRequired,
	popular: PropTypes.bool,
	rawPrice: PropTypes.number,
	title: PropTypes.string.isRequired,
	translate: PropTypes.func,

	// connected props
	currentSitePlan: PropTypes.object,

	// For Monthly Pricing test
	annualPricePerMonth: PropTypes.number,
	flow: PropTypes.string,
};

PlanFeaturesComparisonHeader.defaultProps = {
	popular: false,
};

export default connect( ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );
	const currentSitePlan = getCurrentPlan( state, selectedSiteId );
	return {
		flow: getCurrentFlowName( state ),
		currentSitePlan,
	};
} )( localize( PlanFeaturesComparisonHeader ) );
