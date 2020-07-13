/**
 * External dependencies
 */
import * as React from 'react';
import { __ } from '@wordpress/i18n';
import { Modal, Button } from '@wordpress/components';
import { Icon, wordpress, close } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import './styles.scss';

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
	const [ isOpen, setOpen ] = React.useState( true );

	const handleClose = () => {
		setOpen( false );
		onClose?.();
	};

	return (
		<>
			{ isOpen && (
				<Modal
					className="nux-launch-modal"
					overlayClassName="nux-launch-modal-overlay"
					bodyOpenClassName="has-nux-launch-modal"
					onRequestClose={ handleClose }
					title=""
				>
					<div className="nux-launch-modal-header">
						<div className="nux-launch-modal-header__wp-logo">
							<Icon icon={ wordpress } size={ 36 } />
						</div>
						<Button
							isLink
							className="nux-launch-modal-header__close-button"
							onClick={ onClose }
							aria-label={ __( 'Close dialog', 'full-site-editing' ) }
						>
							<Icon icon={ close } size={ 24 } />
						</Button>
					</div>
					{ isLaunching ? (
						'launch animation'
					) : (
						<Launch step={ step } onSubmit={ onSubmit }></Launch>
					) }
				</Modal>
			) }
		</>
	);
};

export default LaunchModal;
