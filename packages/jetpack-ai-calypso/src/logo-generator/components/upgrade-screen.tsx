/**
 * External dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { HelpCenter } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
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

const HELP_CENTER_STORE = HelpCenter.register();

export const UpgradeScreen: React.FC< {
	onCancel: () => void;
	upgradeURL: string;
	reason: 'feature' | 'requests';
} > = ( { onCancel, upgradeURL, reason } ) => {
	const { setShowHelpCenter, setShowSupportDoc } = useDispatch( HELP_CENTER_STORE );

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

	const learnMoreLink = localizeUrl(
		'https://wordpress.com/support/create-a-logo-with-jetpack-ai/'
	);
	const onLearnMoreClick = ( event: React.MouseEvent< HTMLButtonElement, MouseEvent > ) => {
		event.preventDefault();
		onCancel();
		setShowHelpCenter( true );
		setShowSupportDoc( learnMoreLink );
	};

	return (
		<div className="jetpack-ai-logo-generator-modal__notice-message-wrapper">
			<div className="jetpack-ai-logo-generator-modal__notice-message">
				<span className="jetpack-ai-logo-generator-modal__loading-message">
					{ reason === 'feature' ? upgradeMessageFeature : upgradeMessageRequests }
				</span>
				&nbsp;
				<Button variant="link" href={ learnMoreLink } onClick={ onLearnMoreClick }>
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
