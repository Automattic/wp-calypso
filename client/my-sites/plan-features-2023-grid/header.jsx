import { getPlans } from '@automattic/calypso-products';
import { getCurrencyObject } from '@automattic/format-currency';
import { NEWSLETTER_FLOW, LINK_IN_BIO_FLOW, LINK_IN_BIO_TLD_FLOW } from '@automattic/onboarding';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import PlanPrice from 'calypso/my-sites/plan-price';

const PLANS_LIST = getPlans();

export class PlanFeatures2023GridHeader extends Component {
	render() {
		return this.renderPlansHeaderNoTabs();
	}

	getPlanPillText() {
		const { flow, translate } = this.props;

		switch ( flow ) {
			case NEWSLETTER_FLOW:
				return translate( 'Best for Newsletters' );
			case LINK_IN_BIO_FLOW:
			case LINK_IN_BIO_TLD_FLOW:
				return translate( 'Best for Link in Bio' );
			default:
				return translate( 'Popular' );
		}
	}

	renderPlansHeaderNoTabs() {
		return (
			<span>
				<div className="plan-features-2023-grid__pricing">
					{ this.renderPriceGroup() }
					{ this.getBillingTimeframe() }
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

			return `per month, ${ annualPriceText } billed annually`;
		}

		return null;
	}

	getBillingTimeframe() {
		const { billingTimeFrame } = this.props;
		const perMonthDescription = this.getPerMonthDescription() || billingTimeFrame;

		return (
			<div className="plan-features-2023-grid__header-billing-info">
				<span>{ perMonthDescription }</span>
			</div>
		);
	}

	renderPriceGroup() {
		const { currencyCode, rawPrice, discountPrice } = this.props;

		if ( discountPrice ) {
			return (
				<span className="plan-features-2023-grid__header-price-group">
					<div className="plan-features-2023-grid__header-price-group-prices">
						<PlanPrice
							currencyCode={ currencyCode }
							rawPrice={ rawPrice }
							displayPerMonthNotation={ false }
							original
						/>
						<PlanPrice
							currencyCode={ currencyCode }
							rawPrice={ discountPrice }
							displayPerMonthNotation={ false }
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
				displayPerMonthNotation={ false }
			/>
		);
	}
}

PlanFeatures2023GridHeader.propTypes = {
	billingTimeFrame: PropTypes.oneOfType( [ PropTypes.string, PropTypes.array ] ),
	currencyCode: PropTypes.string,
	discountPrice: PropTypes.number,
	planType: PropTypes.oneOf( Object.keys( PLANS_LIST ) ).isRequired,
	popular: PropTypes.bool,
	rawPrice: PropTypes.number,
	title: PropTypes.string.isRequired,
	translate: PropTypes.func,

	// For Monthly Pricing test
	annualPricePerMonth: PropTypes.number,
	flow: PropTypes.string,
};

PlanFeatures2023GridHeader.defaultProps = {
	popular: false,
};

export default localize( PlanFeatures2023GridHeader );
