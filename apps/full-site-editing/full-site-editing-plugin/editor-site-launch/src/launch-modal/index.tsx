/**
 * External dependencies
 */
import * as React from 'react';
import { Modal } from '@wordpress/components';

/**
 * Internal dependencies
 */
import './styles.scss';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Launch, { LaunchStepType } from '../launch';

interface Props {
	onClose?: () => void;
	step?: LaunchStepType;
}

const LaunchModal: React.FunctionComponent< Props > = ( { onClose, step } ) => {
	const handleClose = () => {
		onClose?.();
	};

	return (
		<Modal
			className="nux-launch-modal"
			overlayClassName="nux-launch-modal-overlay"
			bodyOpenClassName="has-nux-launch-modal"
			onRequestClose={ handleClose }
			title={ __(
				"You're almost there! Review a few things before launching your site!",
				'full-site-editing'
			) }
		>
			<Launch step={ step }></Launch>
		</Modal>
	);
};

export default LaunchModal;
