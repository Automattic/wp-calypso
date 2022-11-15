import { BlockEditProps } from '@wordpress/blocks';
import { FunctionComponent } from 'react';
import { BlockAttributes, PricingPlan, PricingPlansConfiguration } from '../types';
import PricingPlanDetail from './pricing-plan-detail';
import PricingPlansHeader from './pricing-plans-header';

const useCurrentPlan = (
	plans: PricingPlansConfiguration,
	planSlug: string
): PricingPlan | null => {
	for ( const plan of Object.values( plans ) ) {
		for ( const billing of plan.billing ) {
			if ( billing.planSlug === planSlug ) {
				return plan;
			}
		}
	}
	return null;
};

interface Props {
	plans: PricingPlansConfiguration;
}

const PricingPlans: FunctionComponent<
	Pick< BlockEditProps< BlockAttributes >, 'attributes' | 'setAttributes' > & Props
> = ( { attributes, setAttributes, plans } ) => {
	const currentPlan = useCurrentPlan( plans, attributes.planSlug );

	if ( ! currentPlan ) {
		return null;
	}

	return (
		<div className="wp-block-a8c-pricing-plans">
			<PricingPlansHeader plan={ currentPlan } />
			<PricingPlanDetail
				plan={ currentPlan }
				attributes={ attributes }
				setPlan={ ( planSlug ) => setAttributes( { planSlug } ) }
			/>
		</div>
	);
};

export default PricingPlans;
