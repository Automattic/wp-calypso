import { getPlans, getPlanClass } from '@automattic/calypso-products';
import { getCurrencyObject } from '@automattic/format-currency';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import PlanPrice from 'calypso/my-sites/plan-price';

const PLANS_LIST = getPlans();

export class PlanFeatures2023GridHeader extends Component {
	render() {
		return this.renderPlansHeaderNoTabs();
	}

	renderPlansHeaderNoTabs() {
		const { planType, title } = this.props;

		const headerClasses = classNames( 'plan-features-2023-grid__header', getPlanClass( planType ) );

		return (
			<span>
				<header className={ headerClasses }>
					<h4 className="plan-features-2023-grid__header-title">{ title }</h4>
				</header>
				<div className="plan-features-2023-grid__pricing">
					{ this.renderPriceGroup() }
					{ this.getBillingTimeframe() }
				</div>
				{ this.getAnnualDiscount() }
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
						'plan-features-2023-grid__header-annual-discount': true,
						'plan-features-2023-grid__header-annual-discount-is-loading': isLoading,
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
