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

/**
 * Style dependencies
 */
import './style.scss';

interface Props extends Partial< PlansGridProps > {
	isOpen: boolean;
	onClose: () => void;
}

const PlansGridModal: React.FunctionComponent< Props > = ( { isOpen, onClose } ) => {
	// This is needed otherwise it throws a warning.
	Modal.setAppElement( '#wpcom' );

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
