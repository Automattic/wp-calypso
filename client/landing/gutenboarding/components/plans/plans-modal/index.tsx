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

	return (
		<Modal
			isOpen={ isOpen }
			className="plans-modal"
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
					<Button isTertiary onClick={ onClose }>
						{ __( 'Close' ) }
					</Button>
				}
				currentPlan={ currentPlan }
			/>
		</Modal>
	);
};

export default PlansGridModal;
