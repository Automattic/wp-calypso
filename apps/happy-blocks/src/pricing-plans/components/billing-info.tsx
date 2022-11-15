import { FunctionComponent } from 'react';
import { PricingPlanBilling } from '../types';

interface Props {
	billing: PricingPlanBilling;
}

const BillingInfo: FunctionComponent< Props > = ( { billing } ) => {
	return (
		<div className="wp-block-a8c-pricing-plans__detail-current-billing">
			<span className="wp-block-a8c-pricing-plans__detail-current-billing-value">
				{ billing.price }
			</span>
			<span className="wp-block-a8c-pricing-plans__detail-current-billing-description">
				/{ billing.period }
			</span>
		</div>
	);
};

export default BillingInfo;
