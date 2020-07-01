/**
 * External dependencies
 */
import * as React from 'react';
import { Modal } from '@wordpress/components';

/**
 * Internal dependencies
 */
import './styles.scss';

import Launch, { LaunchStepType } from '../launch';

interface Props {
	onClose?: () => void;
	step?: LaunchStepType;
}

const LaunchModal: React.FunctionComponent< Props > = ( { onClose, step } ) => {
	const handleClose = () => {
		onClose && onClose();
	};

	return (
		<Modal
			className="launch-modal"
			overlayClassName="launch-modal-overlay"
			bodyOpenClassName="has-launch-modal"
			onRequestClose={ handleClose }
			title="You're almost there! Review a few things before launching your site!"
		>
			<Launch step={ step }></Launch>
		</Modal>
	);
};

export default LaunchModal;
