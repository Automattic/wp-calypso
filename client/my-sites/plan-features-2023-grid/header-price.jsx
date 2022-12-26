import { PLAN_FREE, PLAN_ENTERPRISE_GRID_WPCOM } from '@automattic/calypso-products';
import { getCurrencyObject } from '@automattic/format-currency';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import PlanPrice from 'calypso/my-sites/plan-price';

export class PlanFeatures2023GridHeaderPrice extends Component {
	render() {
		return this.renderPlansHeader();
	}

	renderPlansHeader() {
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
			planName,
		} = this.props;

		if ( [ PLAN_FREE, PLAN_ENTERPRISE_GRID_WPCOM ].includes( planName ) ) {
			return null;
		}

		if ( isMonthlyPlan && annualPricePerMonth < rawPrice ) {
			const discountRate = Math.round( ( 100 * ( rawPrice - annualPricePerMonth ) ) / rawPrice );
			return translate( `Save %(discountRate)s%% by paying annually`, { args: { discountRate } } );
		}

		if ( ! isMonthlyPlan ) {
			const annualPriceObj = getCurrencyObject( rawPriceAnnual, currencyCode );
			const annualPriceText = `${ annualPriceObj.symbol }${ annualPriceObj.integer }`;

			return translate( 'per month, %(annualPriceText)s billed annually', {
				args: { annualPriceText },
			} );
		}

		return null;
	}

	getBillingTimeframe() {
		const { billingTimeFrame } = this.props;
		const perMonthDescription = this.getPerMonthDescription() || billingTimeFrame;

		return (
			<div className="plan-features-2023-grid__header-billing-info">{ perMonthDescription }</div>
		);
	}

	renderPriceGroup() {
		const {
			currencyCode,
			rawPrice,
			discountPrice,
			planName,
			is2023OnboardingPricingGrid,
			translate,
		} = this.props;

		if ( PLAN_ENTERPRISE_GRID_WPCOM === planName ) {
			return (
				<div className="plan-features-2023-grid__vip-price">
					{ translate( 'Starts at {{b}}US$25,000{{/b}} yearly.', {
						components: { b: <b /> },
					} ) }
				</div>
			);
		}

		if ( discountPrice ) {
			return (
				<span className="plan-features-2023-grid__header-price-group">
					<div className="plan-features-2023-grid__header-price-group-prices">
						<PlanPrice
							currencyCode={ currencyCode }
							rawPrice={ rawPrice }
							displayPerMonthNotation={ false }
							is2023OnboardingPricingGrid={ is2023OnboardingPricingGrid }
							original
						/>
						<PlanPrice
							currencyCode={ currencyCode }
							rawPrice={ discountPrice }
							displayPerMonthNotation={ false }
							is2023OnboardingPricingGrid={ is2023OnboardingPricingGrid }
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
				is2023OnboardingPricingGrid={ is2023OnboardingPricingGrid }
			/>
		);
	}
}

PlanFeatures2023GridHeaderPrice.propTypes = {
	billingTimeFrame: PropTypes.oneOfType( [ PropTypes.string, PropTypes.array ] ),
	currencyCode: PropTypes.string,
	discountPrice: PropTypes.number,
	rawPrice: PropTypes.number,
	translate: PropTypes.func,
	annualPricePerMonth: PropTypes.number,
};

export default localize( PlanFeatures2023GridHeaderPrice );
