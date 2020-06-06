/**
 * External dependencies
 */
import * as React from 'react';
import { Modal } from '@wordpress/components';

/**
 * Internal dependencies
 */
import DomainPicker, { Props as DomainPickerProps } from '@automattic/domain-picker';
import './styles.scss';

interface Props extends DomainPickerProps {
	isOpen: boolean;
	onMoreOptions?: () => void;
}

const DomainPickerModal: React.FunctionComponent< Props > = ( { isOpen, onClose, ...props } ) => {
	if ( ! isOpen ) {
		return null;
	}

	return (
		<Modal
			className="domain-picker-modal"
			overlayClassName="domain-picker-modal-overlay"
			bodyOpenClassName="has-domain-picker-modal"
			onRequestClose={ onClose }
			title=""
		>
			<DomainPicker
				showDomainConnectButton
				onClose={ onClose }
				showDomainCategories
				quantity={ 10 }
				{ ...props }
			/>
		</Modal>
	);
};

export default DomainPickerModal;
