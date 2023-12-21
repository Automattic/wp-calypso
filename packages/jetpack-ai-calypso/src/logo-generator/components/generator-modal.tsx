/**
 * External dependencies
 */
import { Button, Modal } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data'; // Add the missing import statement for 'select'
import { __ } from '@wordpress/i18n';
import React, { useCallback } from 'react';
/**
 * Internal dependencies
 */
import useLogo from '../hooks/use-logo';
import './generator-modal.scss';
import { STORE_WPCOM_PLANS } from '../store';

interface GeneratorModalProps {
	siteId: string;
	isOpen: boolean;
	onClose: () => void;
}

export const GeneratorModal: React.FC< GeneratorModalProps > = ( { isOpen, onClose, siteId } ) => {
	const { message } = useLogo( {} );
	const { increaseAiAssistantRequestsCount } = useDispatch( STORE_WPCOM_PLANS );
	const aiData = useSelect(
		// @ts-expect-error Missing type definition
		( select ) => ( siteId ? select( STORE_WPCOM_PLANS ).getAiAssistantFeature( siteId ) : {} ),
		[ siteId ]
	);

	const handleIncreaseCount = useCallback( () => {
		increaseAiAssistantRequestsCount();
	}, [ increaseAiAssistantRequestsCount ] );

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
					<div className="jetpack-ai-logo-generator-modal__body">
						{ message }
						<Button variant="primary" onClick={ handleIncreaseCount }>
							Increase
						</Button>
						<pre>{ JSON.stringify( aiData, null, 2 ) }</pre>
					</div>
				</Modal>
			) }
		</>
	);
};
