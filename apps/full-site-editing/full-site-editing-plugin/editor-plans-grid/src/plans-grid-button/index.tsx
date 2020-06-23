/**
 * External dependencies
 */
import * as React from 'react';

import 'a8c-fse-common-data-stores';

// import PlansModal from '../plans-modal';
import { Button } from '@wordpress/components';
import { Icon, chevronDown } from '@wordpress/icons';
import { useSelectedPlan } from '../hooks/use-selected-plan';

const PlansGridButton = () => {
	const [ isPlansModalVisible, setPlansModalVisibility ] = React.useState( false );

	useSelectedPlan();
	// const currentPlan = useSelectedPlan();

	// TODO: Get current domain from domain store
	// const currentDomain = '';

	return (
		<>
			<Button
				aria-expanded={ isPlansModalVisible }
				aria-haspopup="menu"
				aria-pressed={ isPlansModalVisible }
				onClick={ () => setPlansModalVisibility( ( s ) => ! s ) }
			>
				<span>Plans</span>
				<Icon icon={ chevronDown } size={ 22 } />
			</Button>
			{ /* <PlansModal
				isOpen={ isPlansModalVisible }
				currentDomain={ currentDomain }
				currentPlan={ currentPlan }
				onClose={ () => setPlansModalVisibility( false ) }
			/> */ }
		</>
	);
};

export default PlansGridButton;
