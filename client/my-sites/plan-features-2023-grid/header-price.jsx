import { isWpcomEnterpriseGridPlan } from '@automattic/calypso-products';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import PlanPrice from 'calypso/my-sites/plan-price';

export class PlanFeatures2023GridHeaderPrice extends Component {
	render() {
		return (
			<span>
				<div className="plan-features-2023-grid__pricing">{ this.renderPriceGroup() }</div>
			</span>
		);
	}

	renderPriceGroup() {
		const { currencyCode, rawPrice, discountPrice, planName, is2023OnboardingPricingGrid } =
			this.props;

		if ( isWpcomEnterpriseGridPlan( planName ) ) {
			return null;
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
	currencyCode: PropTypes.string,
	discountPrice: PropTypes.number,
	rawPrice: PropTypes.number,
	is2023OnboardingPricingGrid: PropTypes.bool,
};

export default localize( PlanFeatures2023GridHeaderPrice );
