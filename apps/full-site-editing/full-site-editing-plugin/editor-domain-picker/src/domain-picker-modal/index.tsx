/**
 * External dependencies
 */
import * as React from 'react';
import { Modal } from '@wordpress/components';

/**
 * Internal dependencies
 */
import DomainPickerFSE from '../domain-picker-fse';
import './styles.scss';

interface Props {
	onClose: () => void;
}

const DomainPickerModal: React.FunctionComponent< Props > = ( { onClose } ) => {
	return (
		<Modal
			className="domain-picker-modal"
			overlayClassName="domain-picker-modal-overlay"
			bodyOpenClassName="has-domain-picker-modal"
			onRequestClose={ onClose }
			title=""
		>
			<DomainPickerFSE onSelect={ onClose } />
		</Modal>
	);
};

export default DomainPickerModal;
