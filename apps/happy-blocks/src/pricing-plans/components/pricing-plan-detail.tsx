import { BlockSaveProps } from '@wordpress/blocks';
import { find } from 'lodash';
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
		find( plan.billing, { planSlug: attributes.planSlug } ) ?? plan.billing[ 0 ];

	return (
		<section className="wp-block-a8c-pricing-plans__detail">
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
