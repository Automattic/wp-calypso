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

interface Props extends DomainPickerProps {
	isOpen: boolean;
	onMoreOptions?: () => void;
}

const DomainPickerModal: React.FunctionComponent< Props > = ( { isOpen, ...props } ) => {
	// This is needed otherwise it throws a warning.
	Modal.setAppElement( '#wpcom' );

	if ( ! isOpen ) return null;

	return (
		<Modal
			isOpen
			className="domain-picker-modal"
			overlayClassName="domain-picker-modal-overlay"
			bodyOpenClassName="has-domain-picker-modal"
		>
			<DomainPicker showDomainConnectButton showDomainCategories { ...props } />
		</Modal>
	);
};

export default DomainPickerModal;
