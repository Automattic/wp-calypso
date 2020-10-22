/**
 * External dependencies
 */
import * as React from 'react';
import { __ } from '@wordpress/i18n';
import { Modal, Button } from '@wordpress/components';
import { Icon, wordpress, close } from '@wordpress/icons';
import FocusedLaunch from '../focused-launch';

import './styles.scss';

interface Props {
	onClose: () => void;
}

const FocusedLaunchModal: React.FunctionComponent< Props > = ( { onClose } ) => {
	return (
		<Modal
			open={ true }
			className="focused-launch-modal"
			overlayClassName="focused-launch-modal-overlay"
			bodyOpenClassName="has-focused-launch-modal"
			onRequestClose={ onClose }
			title=""
		>
			<>
				<div className="focused-launch-modal-body">
					<div className="focused-launch-modal-header">
						<div className="focused-launch-modal-header__wp-logo">
							<Icon icon={ wordpress } size={ 36 } />
						</div>
						<Button
							isLink
							className="focused-launch-modal__close-button"
							onClick={ onClose }
							aria-label={ __( 'Close dialog', 'full-site-editing' ) }
							disabled={ ! onClose }
						>
							<span>
								<Icon icon={ close } size={ 24 } />
							</span>
						</Button>
					</div>
					<div className="focused-launch-body">
						<div className="focused-launch-inputs">
							<FocusedLaunch />
						</div>
						<div className="focused-launch-modal-aside">
							<div>
								<strong>46.9%</strong> of globally registered domains are <strong>.com</strong>
							</div>
						</div>
					</div>
				</div>
			</>
		</Modal>
	);
};

export default FocusedLaunchModal;
