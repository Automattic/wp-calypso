/**
 * External dependencies
 */
import * as React from 'react';
import Modal from 'react-modal';

/**
 * Internal dependencies
 */
import DomainPicker, { Props as DomainPickerProps } from '@automattic/domain-picker';

/**
 * Style dependencies
 */
import './style.scss';

interface Props extends DomainPickerProps {
	isOpen: boolean;
	onOpen?: () => void;
	onMoreOptions?: () => void;
}

const DomainPickerModal: React.FunctionComponent< Props > = ( { isOpen, onOpen, ...props } ) => {
	// This is needed otherwise it throws a warning.
	Modal.setAppElement( '#wpcom' );

	if ( ! isOpen ) return null;

	const handleAfterOpen = () => {
		// This fixes modal being shown without
		// header margin when the modal is opened.
		window.scrollTo( 0, 0 );
		onOpen && onOpen();
	};

	return (
		<Modal
			isOpen
			onAfterOpen={ handleAfterOpen }
			className="domain-picker-modal"
			overlayClassName="domain-picker-modal-overlay"
			bodyOpenClassName="has-domain-picker-modal"
		>
			<DomainPicker showDomainConnectButton showDomainCategories quantity={ 10 } { ...props } />
		</Modal>
	);
};

export default DomainPickerModal;
