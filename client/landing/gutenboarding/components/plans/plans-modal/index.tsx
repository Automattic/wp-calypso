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
import PlansGrid, { Props as PlansGridProps } from '../plans-grid';
import { STORE_KEY as PLANS_STORE } from '../../../stores/plans';
import { useTrackModal } from '../../../hooks/use-track-modal';
import { useSelectedPlan } from '../../../hooks/use-selected-plan';

/**
 * Style dependencies
 */
import './style.scss';

interface Props extends Partial< PlansGridProps > {
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
	const selectedPlanRef = React.useRef();
	React.useEffect( () => {
		selectedPlanRef.current = plan?.getStoreSlug();
	}, [ plan ] );

	useTrackModal( 'PlansGrid', () => ( {
		selected_plan: selectedPlanRef.current,
	} ) );

	const handleConfirm = () => {
		setPlan( plan?.getStoreSlug() );
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
