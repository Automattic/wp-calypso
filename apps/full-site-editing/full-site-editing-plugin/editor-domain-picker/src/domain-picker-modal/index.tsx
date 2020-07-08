/**
 * External dependencies
 */
import * as React from 'react';
import { Modal } from '@wordpress/components';

/**
 * Internal dependencies
 */
import DomainPickerFSE, { Props as DomainPickerFSEProps } from '../domain-picker-fse';
import './styles.scss';

interface Props extends DomainPickerFSEProps {
	onClose: () => void;
}

const DomainPickerModal: React.FunctionComponent< Props > = ( { onClose, ...props } ) => {
	return (
		<Modal
			className="domain-picker-modal"
			overlayClassName="domain-picker-modal-overlay"
			bodyOpenClassName="has-domain-picker-modal"
			onRequestClose={ onClose }
			title=""
		>
			<DomainPickerFSE { ...props } />
		</Modal>
	);
};

export default DomainPickerModal;
