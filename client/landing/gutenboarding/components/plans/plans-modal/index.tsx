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
import { Plan } from '../../../lib/plans';

/**
 * Style dependencies
 */
import './style.scss';

interface Props extends Partial< PlansGridProps > {
	isOpen: boolean;
	onConfirm: ( plan: Plan ) => void;
	onClose: () => void;
}

const PlansGridModal: React.FunctionComponent< Props > = ( {
	isOpen,
	currentPlan,
	onConfirm,
	onClose,
} ) => {
	// This is needed otherwise it throws a warning.
	Modal.setAppElement( '#wpcom' );

	const handleConfirm = ( plan: Plan ) => {
		onConfirm( plan );
		onClose();
	};

	React.useEffect( () => {
		setTimeout( () => window.scrollTo( 0, 0 ), 0 );
	}, [ isOpen ] );

	return (
		<Modal
			isOpen={ isOpen }
			className="gutenboarding-page plans-modal"
			overlayClassName="plans-modal-overlay"
			bodyOpenClassName="has-plans-modal"
		>
			<PlansGrid
				renderConfirmButton={ ( plan: Plan ) => (
					<Button isPrimary onClick={ () => handleConfirm( plan ) }>
						{ __( 'Confirm' ) }
					</Button>
				) }
				cancelButton={
					<Button isLink onClick={ onClose }>
						{ __( 'Close' ) }
					</Button>
				}
				currentPlan={ currentPlan }
			/>
		</Modal>
	);
};

export default PlansGridModal;
