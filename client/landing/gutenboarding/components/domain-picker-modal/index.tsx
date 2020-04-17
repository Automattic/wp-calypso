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
	if ( ! isOpen ) return null;
	return (
		<Modal isOpen className="domain-picker-modal" overlayClassName="domain-picker-modal-overlay">
			<DomainPicker showDomainConnectButton showDomainCategories { ...props } />
		</Modal>
	);
};

export default DomainPickerModal;
