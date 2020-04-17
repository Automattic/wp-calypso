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

const DomainPickerModal: React.FunctionComponent< DomainPickerProps > = props => {
	return (
		<Modal isOpen className="domain-picker-modal" overlayClassName="domain-picker-modal-overlay">
			<DomainPicker showDomainConnectButton showDomainCategories { ...props } />
		</Modal>
	);
};

export default DomainPickerModal;
