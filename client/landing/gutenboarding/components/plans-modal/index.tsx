/**
 * External dependencies
 */
import * as React from 'react';
import Modal from 'react-modal';
import { useDispatch } from '@wordpress/data';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import PlansGrid from '@automattic/plans-grid';

/**
 * Internal dependencies
 */
import { PLANS_STORE } from '../../stores/plans';
import { useTrackModal } from '../../hooks/use-track-modal';
import { useSelectedPlan } from '../../hooks/use-selected-plan';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	onClose: () => void;
}

const PlansGridModal: React.FunctionComponent< Props > = ( { onClose } ) => {
	// This is needed otherwise it throws a warning.
	Modal.setAppElement( '#wpcom' );

	const plan = useSelectedPlan();
	const { setPlan } = useDispatch( PLANS_STORE );

	React.useEffect( () => {
		setTimeout( () => window.scrollTo( 0, 0 ), 0 );
	}, [] );

	// Keep a copy of the selected plan locally so it's available when the component is unmounting
	const selectedPlanRef = React.useRef< string | undefined >();

	React.useEffect( () => {
		selectedPlanRef.current = plan?.storeSlug;
	}, [ plan ] );

	useTrackModal( 'PlansGrid', () => ( {
		selected_plan: selectedPlanRef.current,
	} ) );

	const handleConfirm = () => {
		setPlan( plan?.storeSlug );
		onClose();
	};

	return (
		<Modal
			isOpen
			className="gutenboarding-page plans-modal"
			overlayClassName="plans-modal-overlay"
			bodyOpenClassName="has-plans-modal"
		>
			<PlansGrid
				currentPlan={ plan }
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
