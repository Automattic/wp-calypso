/**
 * External dependencies
 */
import { Button, Modal } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data'; // Add the missing import statement for 'select'
import React, { useCallback } from 'react';
/**
 * Internal dependencies
 */
import { STORE_WPCOM_PLANS } from '../store';
import './generator-modal.scss';

interface StoreTesterProps {
	siteId: string;
	isOpen: boolean;
	onClose: () => void;
}

export const StoreTester: React.FC< StoreTesterProps > = ( { isOpen, onClose, siteId } ) => {
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
					title="Jetpack AI Logo Generator Store Tester"
				>
					<div className="jetpack-ai-logo-generator-modal__body">
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
