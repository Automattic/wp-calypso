import { BlockEditProps } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
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
	const currentPlan = plans?.find( ( plan ) => plan.productSlug === attributes.productSlug );

	if ( ! currentPlan ) {
		return <div>{ __( 'The selected plan is not available at this moment', 'happy-blocks' ) }</div>;
	}

	return (
		<div className="hb-pricing-plans-embed">
			<PricingPlansHeader plan={ currentPlan } />
			<PricingPlanDetail
				plan={ currentPlan }
				plans={ plans }
				attributes={ attributes }
				setPlan={ ( productSlug ) => setAttributes( { productSlug } ) }
			/>
		</div>
	);
};

export default PricingPlans;
