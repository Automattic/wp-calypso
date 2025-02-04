/**
 * External dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import { EVENT_PLACEMENT_FREE_USER_SCREEN, EVENT_UPGRADE } from '../../constants';
import useLogoGenerator from '../hooks/use-logo-generator';
/**
 * Types
 */
import type React from 'react';

export const UpgradeScreen: React.FC< {
	onCancel: () => void;
	upgradeURL: string;
	reason: 'feature' | 'requests';
} > = ( { onCancel, upgradeURL, reason } ) => {
	const upgradeMessageFeature = __(
		'Upgrade your Jetpack AI for access to exclusive features, including logo generation. This upgrade will also increase the amount of requests you can use in all AI-powered features.',
		'jetpack'
	);

	const upgradeMessageRequests = __(
		'Not enough requests left to generate a logo. Upgrade your Jetpack AI to increase the amount of requests you can use in all AI-powered features.',
		'jetpack'
	);

	const { context } = useLogoGenerator();

	const handleUpgradeClick = () => {
		recordTracksEvent( EVENT_UPGRADE, { context, placement: EVENT_PLACEMENT_FREE_USER_SCREEN } );
		onCancel();
	};

	return (
		<div className="jetpack-ai-logo-generator-modal__notice-message-wrapper">
			<div className="jetpack-ai-logo-generator-modal__notice-message">
				<span className="jetpack-ai-logo-generator-modal__loading-message">
					{ reason === 'feature' ? upgradeMessageFeature : upgradeMessageRequests }
				</span>
				&nbsp;
				<Button variant="link" href="https://jetpack.com/ai/">
					{ __( 'Learn more', 'jetpack' ) }
				</Button>
			</div>
			<div className="jetpack-ai-logo-generator-modal__notice-actions">
				<Button variant="tertiary" onClick={ onCancel }>
					{ __( 'Cancel', 'jetpack' ) }
				</Button>
				<Button variant="primary" href={ upgradeURL } onClick={ handleUpgradeClick }>
					{ __( 'Upgrade', 'jetpack' ) }
				</Button>
			</div>
		</div>
	);
};
