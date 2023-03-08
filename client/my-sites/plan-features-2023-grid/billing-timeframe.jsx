import { isWpComFreePlan, isWpcomEnterpriseGridPlan } from '@automattic/calypso-products';
import { getCurrencyObject } from '@automattic/format-currency';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

function getPerMonthDescription( {
	rawPrice,
	rawPriceAnnual,
	currencyCode,
	annualPricePerMonth,
	isMonthlyPlan,
	planName,
	translate,
	billingPeriod,
} ) {
	if ( isWpComFreePlan( planName ) || isWpcomEnterpriseGridPlan( planName ) ) {
		return null;
	}

	if ( isMonthlyPlan && annualPricePerMonth < rawPrice ) {
		const discountRate = Math.round( ( 100 * ( rawPrice - annualPricePerMonth ) ) / rawPrice );
		return translate( `Save %(discountRate)s%% by paying annually`, { args: { discountRate } } );
	}

	if ( ! isMonthlyPlan ) {
		const annualPriceObj = getCurrencyObject( rawPriceAnnual, currencyCode );
		const annualPriceText = `${ annualPriceObj?.symbol }${ annualPriceObj?.integer }`;

		if ( billingPeriod === 365 ) {
			return translate( 'per month, %(annualPriceText)s billed annually', {
				args: { annualPriceText },
			} );
		}

		if ( billingPeriod === 730 ) {
			return translate( 'per month, %(annualPriceText)s billed every two years', {
				args: { annualPriceText },
			} );
		}
	}

	return null;
}

const PlanFeatures2023GridBillingTimeframe = ( props ) => {
	const { planName, billingTimeframe, translate } = props;

	const perMonthDescription = getPerMonthDescription( props ) || billingTimeframe;

	if ( isWpcomEnterpriseGridPlan( planName ) ) {
		return (
			<div className="plan-features-2023-grid__vip-price">
				{ translate( 'Starts at {{b}}US$25,000{{/b}} yearly.', {
					components: { b: <b /> },
					comment: 'Translators: the price is in US dollars for all users (US$25,000)',
				} ) }
			</div>
		);
	}

	return <div>{ perMonthDescription }</div>;
};

PlanFeatures2023GridBillingTimeframe.propTypes = {
	planName: PropTypes.string,
	billingTimeframe: PropTypes.oneOfType( [ PropTypes.string, PropTypes.array ] ),
	billingPeriod: PropTypes.number,
	translate: PropTypes.func,
	rawPrice: PropTypes.number,
	rawPriceAnnual: PropTypes.number,
	currencyCode: PropTypes.string,
	annualPricePerMonth: PropTypes.number,
	isMonthlyPlan: PropTypes.bool,
};

export default localize( PlanFeatures2023GridBillingTimeframe );
