/**
 * External dependencies
 */
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
/**
 * Types
 */
import type React from 'react';

export const FeatureFetchFailureScreen: React.FC< {
	onCancel: () => void;
	onRetry: () => void;
} > = ( { onCancel, onRetry } ) => {
	const errorMessage = __(
		'We are sorry. There was an error loading your Jetpack AI account settings. Please, try again.',
		'jetpack'
	);

	return (
		<div className="jetpack-ai-logo-generator-modal__notice-message-wrapper">
			<div className="jetpack-ai-logo-generator-modal__notice-message">
				<span className="jetpack-ai-logo-generator-modal__loading-message">{ errorMessage }</span>
			</div>
			<div className="jetpack-ai-logo-generator-modal__notice-actions">
				<Button variant="tertiary" onClick={ onCancel }>
					{ __( 'Cancel', 'jetpack' ) }
				</Button>
				<Button variant="primary" onClick={ onRetry }>
					{ __( 'Try again', 'jetpack' ) }
				</Button>
			</div>
		</div>
	);
};
