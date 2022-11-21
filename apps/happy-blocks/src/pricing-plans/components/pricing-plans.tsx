import { BlockEditProps } from '@wordpress/blocks';
import { FunctionComponent } from 'react';
import { BlockPlan } from '../hooks/pricing-plans';
import { BlockAttributes } from '../types';
import PricingPlanDetail from './pricing-plan-detail';
import PricingPlansHeader from './pricing-plans-header';

interface Props {
	plans: BlockPlan[];
}

const PricingPlans: FunctionComponent<
	Pick< BlockEditProps< BlockAttributes >, 'attributes' | 'setAttributes' > & Props
> = ( { attributes, setAttributes, plans } ) => {
	const currentPlan = plans?.find( ( plan ) => plan.productSlug === attributes.planSlug );

	if ( ! currentPlan ) {
		return null;
	}

	return (
		<div className="hb-pricing-plans-embed">
			<PricingPlansHeader plan={ currentPlan } />
			<PricingPlanDetail
				plan={ currentPlan }
				plans={ plans }
				attributes={ attributes }
				setPlan={ ( planSlug ) => setAttributes( { planSlug } ) }
			/>
		</div>
	);
};

export default PricingPlans;
