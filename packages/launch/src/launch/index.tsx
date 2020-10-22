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
			className="launch__focused-modal"
			overlayClassName="launch__focused-modal-overlay"
			bodyOpenClassName="has-focused-launch-modal"
			onRequestClose={ onClose }
			title=""
		>
			<>
				<div className="launch__focused-modal-wrapper ">
					<div className="launch__focused-modal-header">
						<div className="launch__focused-modal-header-wp-logo">
							<Icon icon={ wordpress } size={ 36 } />
						</div>
						<Button
							isLink
							className="launch__focused-modal-close-button"
							onClick={ onClose }
							aria-label={ __( 'Close dialog', 'full-site-editing' ) }
							disabled={ ! onClose }
						>
							<span>
								<Icon icon={ close } size={ 24 } />
							</span>
						</Button>
					</div>
					<div className="launch__focused-modal-body">
						<div className="launch__focused-modal-inputs">
							<FocusedLaunch />
						</div>
						<div className="launch__focused-modal-aside">
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
