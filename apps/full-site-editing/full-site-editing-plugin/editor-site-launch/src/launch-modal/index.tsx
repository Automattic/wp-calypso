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
	onSubmit?: () => void;
	step?: LaunchStepType;
	isLaunching?: boolean;
}

const LaunchModal: React.FunctionComponent< Props > = ( {
	onClose,
	onSubmit,
	step,
	isLaunching,
} ) => {
	const handleClose = () => {
		onClose?.();
	};

	return (
		<Modal
			className="nux-launch-modal"
			overlayClassName="nux-launch-modal-overlay"
			bodyOpenClassName="has-nux-launch-modal"
			onRequestClose={ handleClose }
			title={
				isLaunching
					? __( 'Hooray! Your site will be ready shortly.', 'full-site-editing' )
					: __(
							"You're almost there! Review a few things before launching your site!",
							'full-site-editing'
					  )
			}
		>
			{ isLaunching ? 'launch animation' : <Launch step={ step } onSubmit={ onSubmit }></Launch> }
		</Modal>
	);
};

export default LaunchModal;
