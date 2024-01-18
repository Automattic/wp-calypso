/**
 * External dependencies
 */
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
/**
 * Types
 */
import type React from 'react';

export const UpgradeScreen: React.FC< { onCancel: () => void; upgradeURL: string } > = ( {
	onCancel,
	upgradeURL,
} ) => {
	const upgradeMessage = __(
		'Upgrade your Jetpack AI for access to exclusive features, including logo generation. This upgrade will also increase the amount of requests you can use in all AI-powered features.',
		'jetpack'
	);

	return (
		<div className="jetpack-ai-logo-generator-modal__notice-message-wrapper">
			<div className="jetpack-ai-logo-generator-modal__notice-message">
				<span className="jetpack-ai-logo-generator-modal__loading-message">{ upgradeMessage }</span>
				&nbsp;
				<Button variant="link" href="https://jetpack.com/ai/" target="_blank">
					{ __( 'Learn more', 'jetpack' ) }
				</Button>
			</div>
			<div className="jetpack-ai-logo-generator-modal__notice-actions">
				<Button variant="tertiary" onClick={ onCancel }>
					{ __( 'Cancel', 'jetpack' ) }
				</Button>
				<Button variant="primary" href={ upgradeURL } target="_blank" onClick={ onCancel }>
					{ __( 'Upgrade', 'jetpack' ) }
				</Button>
			</div>
		</div>
	);
};
