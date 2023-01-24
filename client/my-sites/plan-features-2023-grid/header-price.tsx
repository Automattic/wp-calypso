import { isWpcomEnterpriseGridPlan } from '@automattic/calypso-products';
import PropTypes from 'prop-types';
import PlanPrice from 'calypso/my-sites/plan-price';

interface PlanFeatures2023GridHeaderPriceProps {
	planName: string;
	discountPrice: number | null;
	currencyCode: string | null;
	rawPrice: number;
	is2023OnboardingPricingGrid: boolean;
	isLargeCurrency: boolean;
}

const PlanFeatures2023GridHeaderPrice = ( {
	planName,
	discountPrice,
	currencyCode,
	rawPrice,
	is2023OnboardingPricingGrid,
	isLargeCurrency,
}: PlanFeatures2023GridHeaderPriceProps ) => {
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
							isLargeCurrency={ isLargeCurrency }
							original
						/>
						<PlanPrice
							currencyCode={ currencyCode }
							rawPrice={ discountPrice }
							displayPerMonthNotation={ false }
							is2023OnboardingPricingGrid={ is2023OnboardingPricingGrid }
							isLargeCurrency={ isLargeCurrency }
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
					isLargeCurrency={ isLargeCurrency }
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

export default PlanFeatures2023GridHeaderPrice;
