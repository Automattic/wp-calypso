/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import Modal from 'react-modal';

/**
 * Internal dependencies
 */
import DomainPicker, { Props as DomainPickerProps } from '../domain-picker';

/**
 * Style dependencies
 */
import './style.scss';

type DomainSuggestion = import('@automattic/data-stores').DomainSuggestions.DomainSuggestion;

interface Props extends DomainPickerProps {
	onClose?: () => void;
}

const DomainPickerModal: FunctionComponent< Props > = ( { currentDomain } ) => {
	return (
		<Modal
			isOpen={ true }
			className="domain-picker-modal"
			overlayClassName="domain-picker-modal-overlay"
		>
			<DomainPicker
				currentDomain={ currentDomain }
				showDomainConnectButton
				showDomainCategories
			></DomainPicker>
		</Modal>
	);
};

export default DomainPickerModal;
