import { BlockSaveProps } from '@wordpress/blocks';
import { FunctionComponent } from 'react';
import { BlockAttributes, PricingPlan } from '../types';
import BillingButton from './billing-button';
import BillingInfo from './billing-info';
import BillingOptions from './billing-options';

interface Props {
	plan: PricingPlan;
	setPlan: ( planSlug: string ) => void;
}

const PricingPlanDetail: FunctionComponent< BlockSaveProps< BlockAttributes > & Props > = ( {
	plan,
	attributes,
	setPlan,
} ) => {
	const selectedBilling =
		plan.billing.find( ( billing ) => billing.planSlug === attributes.planSlug ) ??
		plan.billing[ 0 ];

	return (
		<section className="hb-pricing-plans-embed__detail">
			<BillingInfo billing={ selectedBilling } />
			<BillingOptions
				billings={ plan.billing }
				value={ attributes.planSlug }
				onChange={ setPlan }
			/>
			<BillingButton href={ selectedBilling.upgradeLink }>{ plan.upgradeLabel }</BillingButton>
		</section>
	);
};
export default PricingPlanDetail;
