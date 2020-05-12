/**
 * External dependencies
 */
import * as React from 'react';
import Modal from 'react-modal';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import PlansGrid, { Props as PlansGridProps } from '../plans-grid';
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

	return (
		<Modal
			isOpen
			className="gutenboarding-page plans-modal"
			overlayClassName="plans-modal-overlay"
			bodyOpenClassName="has-plans-modal"
		>
			<PlansGrid
				confirmButton={
					<Button isPrimary onClick={ onClose }>
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
