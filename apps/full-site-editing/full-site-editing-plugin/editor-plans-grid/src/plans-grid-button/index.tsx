/**
 * External dependencies
 */
import * as React from 'react';
import { useSelect, useDispatch } from '@wordpress/data';
import { Plans } from '@automattic/data-stores';
import { Button } from '@wordpress/components';
import { Icon, chevronDown } from '@wordpress/icons';
import 'a8c-fse-common-data-stores';

/**
 * Internal dependencies
 */
import PlansModal from '../plans-modal';
import { PLANS_STORE } from '../stores';

type PlansSlug = Plans.PlanSlug;

const PlansGridButton = () => {
	const [ isPlansModalVisible, setPlansModalVisibility ] = React.useState( false );

	// TODO: Get current domain from store.
	const currentDomain = undefined;

	// TODO: Proper plan selection as seen in gutenboarding version. Needs currentDomain to work on this.
	const currentPlan = useSelect( ( select ) => {
		const selectedPlan = select( PLANS_STORE ).getSelectedPlan();
		return selectedPlan || undefined;
	} );

	const { setPlan } = useDispatch( PLANS_STORE );

	const handlePlanSelect = ( plan: PlansSlug ) => {
		setPlan( plan );
		setPlansModalVisibility( false );
	};

	return (
		<>
			<Button
				aria-expanded={ isPlansModalVisible }
				aria-haspopup="menu"
				aria-pressed={ isPlansModalVisible }
				onClick={ () => setPlansModalVisibility( ( s ) => ! s ) }
			>
				{ /* TODO: Refine this  */ }
				<span>Plans: { currentPlan && currentPlan.title }</span>
				<Icon icon={ chevronDown } size={ 22 } />
			</Button>
			<PlansModal
				isOpen={ isPlansModalVisible }
				currentDomain={ currentDomain }
				currentPlan={ currentPlan }
				onPlanSelect={ handlePlanSelect }
				onClose={ () => setPlansModalVisibility( false ) }
			/>
		</>
	);
};

export default PlansGridButton;
