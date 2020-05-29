/**
 * External dependencies
 */
import * as React from 'react';
import Modal from 'react-modal';
import { useDispatch } from '@wordpress/data';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { PLANS_STORE } from '../../../stores/plans';
import PlansGrid, { Props as PlansGridProps } from '../plans-grid';
//import { useTrackModal } from '../../../hooks/use-track-modal';

function logTODO( ...args: Array< any > ) {
	console.error( 'TODO', args );
}

const useTrackModal = logTODO;

/**
 * Style dependencies
 */
import './style.scss';

interface Props extends Partial< PlansGridProps > {
	onClose: () => void;
	currentPlan: Plans.Plan;
}

const PlansGridModal: React.FunctionComponent< Props > = ( { onClose, currentPlan } ) => {
	// This is needed otherwise it throws a warning.
	Modal.setAppElement( '#wpcom' );

	const { setPlan } = useDispatch( PLANS_STORE );

	React.useEffect( () => {
		setTimeout( () => window.scrollTo( 0, 0 ), 0 );
	}, [] );

	// Keep a copy of the selected plan locally so it's available when the component is unmounting
	const selectedPlanRef = React.useRef< string | undefined >();

	React.useEffect( () => {
		selectedPlanRef.current = currentPlan?.storeSlug;
	}, [ currentPlan ] );

	useTrackModal( 'PlansGrid', () => ( {
		selected_plan: selectedPlanRef.current,
	} ) );

	const handleConfirm = () => {
		setPlan( currentPlan?.storeSlug );
		onClose();
	};

	return (
		<Modal
			isOpen
			className="plans-ui-page plans-modal"
			overlayClassName="plans-modal-overlay"
			bodyOpenClassName="has-plans-modal"
		>
			<PlansGrid
				currentPlan={ currentPlan }
				confirmButton={
					<Button isPrimary onClick={ handleConfirm }>
						{ __( 'Confirm' ) }
					</Button>
				}
				cancelButton={
					<Button isLink onClick={ onClose }>
						{ __( 'Close' ) }
					</Button>
				}
			/>
		</Modal>
	);
};

export default PlansGridModal;
