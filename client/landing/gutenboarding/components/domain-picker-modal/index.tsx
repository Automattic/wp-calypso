/**
 * External dependencies
 */
import * as React from 'react';
import Modal from 'react-modal';
import { select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import DomainPicker, { Props as DomainPickerProps } from '@automattic/domain-picker';
import { recordEnterModal, recordCloseModal } from '../../lib/analytics';
import { STORE_KEY } from '../../stores/onboard';

/**
 * Style dependencies
 */
import './style.scss';

interface Props extends DomainPickerProps {
	isOpen: boolean;
	onMoreOptions?: () => void;
}

const DomainPickerModal: React.FunctionComponent< Props > = ( { isOpen, onClose, ...props } ) => {
	// This is needed otherwise it throws a warning.
	Modal.setAppElement( '#wpcom' );

	const tracksName = 'DomainPickerModal';

	const handleOpen = () => {
		// This fixes modal being shown without
		// header margin when the modal is opened.
		window.scrollTo( 0, 0 );
		recordEnterModal( tracksName );
	};

	const handleClose = () => {
		recordCloseModal( tracksName, {
			selected_domain: select( STORE_KEY ).getSelectedDomain()?.domain_name,
		} );
		onClose && onClose();
	};

	if ( ! isOpen ) return null;

	return (
		<Modal
			isOpen
			onAfterOpen={ handleOpen }
			onRequestClose={ handleClose }
			className="domain-picker-modal"
			overlayClassName="domain-picker-modal-overlay"
			bodyOpenClassName="has-domain-picker-modal"
		>
			<DomainPicker
				showDomainConnectButton
				showDomainCategories
				quantity={ 10 }
				onClose={ handleClose }
				{ ...props }
			/>
		</Modal>
	);
};

export default DomainPickerModal;
