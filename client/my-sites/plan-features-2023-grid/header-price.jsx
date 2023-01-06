import { isWpcomEnterpriseGridPlan } from '@automattic/calypso-products';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import PlanPrice from 'calypso/my-sites/plan-price';

const PlanFeatures2023GridHeaderPrice = ( {
	planName,
	discountPrice,
	currencyCode,
	rawPrice,
	is2023OnboardingPricingGrid,
} ) => {
	if ( isWpcomEnterpriseGridPlan( planName ) ) {
		return null;
	}

	return (
		<div className="plan-features-2023-grid__pricing">
			{ discountPrice && (
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
			) }
			{ ! discountPrice && (
				<PlanPrice
					currencyCode={ currencyCode }
					rawPrice={ rawPrice }
					displayPerMonthNotation={ false }
					is2023OnboardingPricingGrid={ is2023OnboardingPricingGrid }
				/>
			) }
		</div>
	);
};

PlanFeatures2023GridHeaderPrice.propTypes = {
	planName: PropTypes.string,
	discountPrice: PropTypes.number,
	currencyCode: PropTypes.string,
	rawPrice: PropTypes.number,
	is2023OnboardingPricingGrid: PropTypes.bool,
};

export default localize( PlanFeatures2023GridHeaderPrice );
