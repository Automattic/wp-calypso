/**
 * External dependencies
 */
import { Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import React from 'react';
/**
 * Internal dependencies
 */
import { FirstLoadScreen } from './first-load-screen';
import './generator-modal.scss';

interface GeneratorModalProps {
	siteId?: string;
	isOpen: boolean;
	onClose: () => void;
}

export const GeneratorModal: React.FC< GeneratorModalProps > = ( { isOpen, onClose } ) => {
	const isLoading = true;

	return (
		<>
			{ isOpen && (
				<Modal
					className="jetpack-ai-logo-generator-modal"
					onRequestClose={ onClose }
					shouldCloseOnClickOutside={ false }
					shouldCloseOnEsc={ false }
					title={ __( 'Jetpack AI Logo Generator', 'jetpack' ) }
				>
					<div className="jetpack-ai-logo-generator-modal__body">
						{ isLoading && <FirstLoadScreen /> }
					</div>
				</Modal>
			) }
		</>
	);
};
