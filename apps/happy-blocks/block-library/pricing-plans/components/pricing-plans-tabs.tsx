import clsx from 'clsx';
import { FunctionComponent } from 'react';
import usePlanOptions from '../hooks/plan-options';
import { BlockPlan } from '../hooks/pricing-plans';
import { BlockAttributes } from '../types';

interface Props {
	currentPlan: BlockPlan;
	plans: BlockPlan[];
	setPlan: ( productSlug: string ) => void;
	attributes: BlockAttributes;
}

const PricingPlansTabs: FunctionComponent< Props > = ( {
	currentPlan,
	attributes,
	plans,
	setPlan,
} ) => {
	const planOptions = usePlanOptions( plans );

	const availablePlanOptions = planOptions.filter( ( { value } ) =>
		attributes.planTypeOptions.includes( value )
	);

	const onTabButtonClick = ( type: string ) => {
		const plan = plans.find( ( plan ) => plan.type === type && currentPlan.term === plan.term );
		if ( plan ) {
			setPlan( plan.productSlug );
		}
	};

	return (
		<section className="hb-pricing-plans-embed__tabs">
			{ availablePlanOptions.map( ( planOption ) => (
				<button
					onClick={ () => onTabButtonClick( planOption.value ) }
					className={ clsx( 'hb-pricing-plans-embed__tabs-label', {
						'hb-pricing-plans-embed__tabs-label--active': planOption.value === currentPlan.type,
					} ) }
					key={ planOption.value }
				>
					{ planOption.label }
				</button>
			) ) }
		</section>
	);
};

export default PricingPlansTabs;
