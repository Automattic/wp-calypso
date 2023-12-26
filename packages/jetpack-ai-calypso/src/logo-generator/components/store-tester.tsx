/**
 * External dependencies
 */
import { Button, Modal } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data'; // Add the missing import statement for 'select'
import React, { useCallback, useEffect } from 'react';
/**
 * Internal dependencies
 */
import { STORE_NAME } from '../store';
import './generator-modal.scss';
/**
 * Types
 */
import type { GeneratorModalProps } from '../../types';

export const StoreTester: React.FC< GeneratorModalProps > = ( {
	isOpen,
	onClose,
	siteDetails,
} ) => {
	const siteId = siteDetails?.ID;
	const { increaseAiAssistantRequestsCount, setSiteDetails } = useDispatch( STORE_NAME );
	const [ isLoadingAiFeatureData, aiFeatureData ] = useSelect(
		( select ) => {
			if ( ! isOpen ) {
				return [ false, {} ];
			}
			return [
				// @ts-expect-error Missing type definition
				select( STORE_NAME ).getIsRequestingAiAssistantFeature(),
				// @ts-expect-error Missing type definition
				siteId ? select( STORE_NAME ).getAiAssistantFeature( siteId ) : {},
			];
		},
		[ siteId, isOpen ]
	);

	useEffect( () => {
		setSiteDetails( siteDetails );
	}, [ siteDetails, setSiteDetails ] );

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
						<Button
							disabled={ isLoadingAiFeatureData }
							variant="primary"
							onClick={ handleIncreaseCount }
						>
							Increase
						</Button>
						<br />
						{ isLoadingAiFeatureData ? (
							<p>Loading...</p>
						) : (
							<>
								<span>aiFeatureData</span>: <pre>{ JSON.stringify( aiFeatureData, null, 2 ) }</pre>
								<span>siteDetails:</span>: <pre>{ JSON.stringify( siteDetails, null, 2 ) }</pre>
							</>
						) }
					</div>
				</Modal>
			) }
		</>
	);
};
