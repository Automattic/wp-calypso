/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import Modal from 'react-modal';

/**
 * Internal dependencies
 */
import DomainPicker, { Props as DomainPickerProps } from '../domain-picker';
import CloseButton from '../close-button';

/**
 * Style dependencies
 */
import './style.scss';

type DomainSuggestion = import('@automattic/data-stores').DomainSuggestions.DomainSuggestion;

// TODO: Extend modal props?
// interface Props extends DomainPickerProps {
// }

const DomainPickerModal: FunctionComponent< DomainPickerProps > = ( {
	currentDomain,
	onDomainSelect,
	onClose,
} ) => {
	return (
		<Modal
			isOpen={ true }
			className="domain-picker-modal"
			overlayClassName="domain-picker-modal-overlay"
		>
			<DomainPicker
				showDomainConnectButton
				showDomainCategories
				currentDomain={ currentDomain }
				onDomainSelect={ onDomainSelect }
			/>
			<CloseButton className="domain-picker-modal__close-button" onClick={ onClose } />
		</Modal>
	);
};

export default DomainPickerModal;
