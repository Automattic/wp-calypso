/**
 * External dependencies
 */
import * as React from 'react';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { Modal, Button } from '@wordpress/components';
import { Icon, wordpress, close } from '@wordpress/icons';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { LAUNCH_STORE } from '../stores';
import Launch from '../launch';
import LaunchSidebar from '../launch-sidebar';

import './styles.scss';

interface Props {
	onClose?: () => void;
	onSubmit?: () => void;
	isLaunching?: boolean;
}

const LaunchModal: React.FunctionComponent< Props > = ( { onClose, onSubmit, isLaunching } ) => {
	const { step: currentStep } = useSelect( ( select ) => select( LAUNCH_STORE ).getState() );

	return (
		<Modal
			className={ classnames( 'nux-launch-modal', `step-${ currentStep }` ) }
			overlayClassName="nux-launch-modal-overlay"
			bodyOpenClassName="has-nux-launch-modal"
			onRequestClose={ () => onClose?.() }
			title=""
		>
			<div className="nux-launch-modal-header">
				<div className="nux-launch-modal-header__wp-logo">
					<Icon icon={ wordpress } size={ 36 } />
				</div>
			</div>
			<div className="nux-launch-modal-body">
				{ isLaunching ? 'launch animation' : <Launch onSubmit={ onSubmit }></Launch> }
			</div>
			<div className="nux-launch-modal-aside">
				<LaunchSidebar></LaunchSidebar>
			</div>
			<Button
				isLink
				className="nux-launch-modal__close-button"
				onClick={ onClose }
				aria-label={ __( 'Close dialog', 'full-site-editing' ) }
				disabled={ ! onClose }
			>
				<Icon icon={ close } size={ 24 } />
			</Button>
		</Modal>
	);
};

export default LaunchModal;
