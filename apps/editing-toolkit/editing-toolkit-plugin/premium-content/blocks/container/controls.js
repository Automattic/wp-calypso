/**
 * WordPress dependencies
 */
import { Fragment } from '@wordpress/element';
import { BlockControls } from '@wordpress/block-editor';
import { Dashicon, DropdownMenu, Toolbar } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Plans from './plans';
import NewPlan from './new-plan';

/**
 * @typedef { import('./plans').Plan } Plan
 *
 * @typedef {object} Props
 * @property { number } selectedPlanId
 * @property { (plan: Plan) => void } onSelected
 * @property { (plan: Plan) => string } formatPrice
 * @property { string } className
 * @property { Plan[] } plans
 *
 * @param { Props } props
 */
export default function Controls( props ) {
	const { selectedPlanId, onSelected, plans, getPlanDescription } = props;
	const currentPlan = plans.find( ( plan ) => plan.id === selectedPlanId );
	let planDescription = null;
	if ( currentPlan ) {
		planDescription = ' ' + getPlanDescription( currentPlan );
	}
	return (
		<BlockControls>
			<Toolbar>
				<DropdownMenu
					// @ts-ignore We want a label with our Dashicon.Icon
					icon={
						<Fragment>
							<Dashicon icon="update" />{ ' ' }
							{ planDescription && <Fragment>{ planDescription }</Fragment> }
						</Fragment>
					}
					label={ __( 'Select a plan', 'full-site-editing' ) }
					className={ 'premium-content-toolbar-button' }
				>
					{ ( { onClose } ) => (
						<Fragment>
							<Plans
								{ ...props }
								onSelected={ onSelected }
								onClose={ onClose }
								selectedPlan={ currentPlan }
							/>
							<NewPlan { ...props } onClose={ onClose } />
						</Fragment>
					) }
				</DropdownMenu>
			</Toolbar>
		</BlockControls>
	);
}
