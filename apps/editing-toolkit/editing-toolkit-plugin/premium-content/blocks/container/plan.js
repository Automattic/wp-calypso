/**
 * WordPress dependencies
 */
import { MenuItem } from '@wordpress/components';

/**
 * @typedef {object} Plan
 * @property { number } id
 * @property { string } title
 * @property { string } price
 * @property { string } currency
 * @property { string } interval
 *
 * @typedef {object} Props
 * @property { Plan } plan
 * @property { string } className
 * @property { undefined | Plan } selectedPlan
 * @property { () => void } onClose
 * @property { (plan: Plan) => void } onSelected
 * @property { (plan: Plan) => string } formatPrice
 *
 * @param { Props } props
 */
export default function Plan( props ) {
	const { className, plan, selectedPlan, onSelected, onClose, getPlanDescription } = props;

	const isSelected = selectedPlan && plan.id === selectedPlan.id;
	const classNames = ( isSelected ? [ 'is-selected' ] : [] ).concat( [ className ] ).join( ' ' );
	const icon = isSelected ? 'yes' : undefined;

	let planDescription = null;
	if ( plan ) {
		planDescription = ' ' + getPlanDescription( plan );
	}

	return (
		<MenuItem
			onClick={ ( e ) => {
				e.preventDefault();
				onSelected( plan );
				onClose();
			} }
			className={ classNames }
			key={ plan.id }
			value={ plan.id }
			selected={ isSelected }
			icon={ icon }
		>
			{ plan.title } : { planDescription }
		</MenuItem>
	);
}
