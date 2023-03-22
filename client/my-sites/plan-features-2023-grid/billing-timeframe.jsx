import { isWpComFreePlan, isWpcomEnterpriseGridPlan } from '@automattic/calypso-products';
import { formatCurrency } from '@automattic/format-currency';
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
} ) {
	if ( isWpComFreePlan( planName ) || isWpcomEnterpriseGridPlan( planName ) ) {
		return null;
	}

	if ( isMonthlyPlan && annualPricePerMonth < rawPrice ) {
		const discountRate = Math.round( ( 100 * ( rawPrice - annualPricePerMonth ) ) / rawPrice );
		return translate( `Save %(discountRate)s%% by paying annually`, { args: { discountRate } } );
	}

	if ( ! isMonthlyPlan ) {
		const annualPrice = formatCurrency( rawPriceAnnual, currencyCode );
		return translate( 'per month, %(annualPriceText)s billed annually', {
			args: { annualPriceText: annualPrice },
		} );
	}

	return null;
}

const PlanFeatures2023GridBillingTimeframe = ( props ) => {
	const { planName, billingTimeframe, translate } = props;

	const perMonthDescription = getPerMonthDescription( props ) || billingTimeframe;
	const price = formatCurrency( 25000, 'USD' );

	if ( isWpcomEnterpriseGridPlan( planName ) ) {
		return (
			<div className="plan-features-2023-grid__vip-price">
				{ translate( 'Starts at {{b}}%(price)s{{/b}} yearly.', {
					args: { price },
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
	translate: PropTypes.func,
	rawPrice: PropTypes.number,
	rawPriceAnnual: PropTypes.number,
	currencyCode: PropTypes.string,
	annualPricePerMonth: PropTypes.number,
	isMonthlyPlan: PropTypes.bool,
};

export default localize( PlanFeatures2023GridBillingTimeframe );
