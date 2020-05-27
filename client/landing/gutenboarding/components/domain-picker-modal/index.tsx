/**
 * External dependencies
 */
import * as React from 'react';
import Modal from 'react-modal';

/**
 * Internal dependencies
 */
import DomainPicker, { Props as DomainPickerProps } from '../domain-picker';

/**
 * Style dependencies
 */
import './style.scss';

interface Props extends Omit< DomainPickerProps, 'tracksName' > {
	isOpen: boolean;
	onMoreOptions?: () => void;
}

const DomainPickerModal: React.FunctionComponent< Props > = ( { isOpen, ...props } ) => {
	// This is needed otherwise it throws a warning.
	Modal.setAppElement( '#wpcom' );

	if ( ! isOpen ) return null;

	const handleAfterOpen = () => {
		// This fixes modal being shown without
		// header margin when the modal is opened.
		window.scrollTo( 0, 0 );
	};

	return (
		<Modal
			isOpen
			onAfterOpen={ handleAfterOpen }
			className="domain-picker-modal"
			overlayClassName="domain-picker-modal-overlay"
			bodyOpenClassName="has-domain-picker-modal"
		>
			<DomainPicker
				tracksName="DomainPickerModal"
				showDomainConnectButton
				showDomainCategories
				quantity={ 10 }
				{ ...props }
			/>
		</Modal>
	);
};

export default DomainPickerModal;
