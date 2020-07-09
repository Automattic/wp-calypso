/**
 * External dependencies
 */
import * as React from 'react';
import { Button } from '@wordpress/components';
import { Icon, chevronDown } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import PlansModal from '../plans-modal';
import { useSelectedPlan } from '../hooks/use-selected-plan';

const PlansGridButton = () => {
	const [ isPlansModalVisible, setPlansModalVisibility ] = React.useState( false );
	const currentPlan = useSelectedPlan();

	return (
		<>
			<Button
				aria-expanded={ isPlansModalVisible }
				aria-haspopup="menu"
				aria-pressed={ isPlansModalVisible }
				onClick={ () => setPlansModalVisibility( ( s ) => ! s ) }
			>
				<span>Plans: { currentPlan?.title }</span>
				<Icon icon={ chevronDown } size={ 22 } />
			</Button>
			{ isPlansModalVisible && <PlansModal onClose={ () => setPlansModalVisibility( false ) } /> }
		</>
	);
};

export default PlansGridButton;
