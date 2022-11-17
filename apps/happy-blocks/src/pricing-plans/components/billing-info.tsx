import { FunctionComponent } from 'react';
import { PricingPlanBilling } from '../types';

interface Props {
	billing: PricingPlanBilling;
}

const BillingInfo: FunctionComponent< Props > = ( { billing } ) => {
	return (
		<div className="hb-pricing-plans-embed__billing-info">
			<span className="hb-pricing-plans-embed__billing-info-value">{ billing.price }</span>
			<span className="hb-pricing-plans-embed__billing-info-description">/{ billing.period }</span>
		</div>
	);
};

export default BillingInfo;
