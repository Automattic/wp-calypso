/**
 * External dependencies
 */
import { Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import React from 'react';
/**
 * Internal dependencies
 */
import useLogo from '../hooks/use-logo';
import './generator-modal.scss';

export const GeneratorModal: React.FC< { isOpen: boolean; onClose: () => void } > = ( {
	isOpen,
	onClose,
} ) => {
	const { message } = useLogo( {} );

	return (
		<>
			{ isOpen && (
				<Modal
					className="jetpack-ai-logo-generator-modal"
					onRequestClose={ onClose }
					shouldCloseOnClickOutside={ false }
					shouldCloseOnEsc={ false }
					title={ __( 'Jetpack AI Logo Generator', 'jetpack' ) }
					size="large"
				>
					<div className="jetpack-ai-logo-generator-modal__body">{ message }</div>
				</Modal>
			) }
		</>
	);
};
