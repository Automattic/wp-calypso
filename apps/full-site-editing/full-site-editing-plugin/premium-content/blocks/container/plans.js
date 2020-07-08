/**
 * WordPress dependencies
 */
import { MenuGroup } from '@wordpress/components';

/**
 * Internal dependencies
 */
import Plan from './plan';

/**
 * @typedef { import('./plan').Plan } Plan
 *
 * @typedef {object} Props
 * @property { Plan[] } plans
 * @property { undefined | Plan } selectedPlan
 * @property { (plan: Plan) => void } onSelected
 * @property { () => void } onClose
 * @property { string } className
 *
 * @param {Props} props
 */
export default function Plans( props ) {
	const { plans, selectedPlan, onSelected } = props;

	return (
		<MenuGroup>
			{ plans.map( ( plan ) => (
				<Plan
					{ ...props }
					key={ plan.id }
					selectedPlan={ selectedPlan }
					onSelected={ onSelected }
					plan={ plan }
				/>
			) ) }
		</MenuGroup>
	);
}
