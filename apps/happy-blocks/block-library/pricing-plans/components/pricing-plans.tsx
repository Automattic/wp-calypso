import { BlockEditProps } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { FunctionComponent } from 'react';
import { BlockPlan } from '../hooks/pricing-plans';
import { BlockAttributes } from '../types';
import PricingPlanDetail from './pricing-plan-detail';
import PricingPlansHeader from './pricing-plans-header';
import PricingPlansTabs from './pricing-plans-tabs';

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

	const onSetPlan = ( productSlug: string ) => setAttributes( { productSlug } );

	return (
		<div className="hb-pricing-plans-embed wp-block-embed">
			{ attributes.planTypeOptions.length > 1 && (
				<PricingPlansTabs
					attributes={ attributes }
					plans={ plans }
					currentPlan={ currentPlan }
					setPlan={ onSetPlan }
				/>
			) }
			<div className="hb-pricing-plans-embed__tab">
				<PricingPlansHeader attributes={ attributes } currentPlan={ currentPlan } />
				<PricingPlanDetail
					currentPlan={ currentPlan }
					plans={ plans }
					attributes={ attributes }
					setPlan={ onSetPlan }
				/>
			</div>
		</div>
	);
};

export default PricingPlans;
