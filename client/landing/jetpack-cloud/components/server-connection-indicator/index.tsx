/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import ExternalLink from 'components/external-link';
import Image from 'components/image';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	isConnected: boolean;
	/* @todo: figure out which type of backup we are */
	// backupType: 'daily' | 'realtime';
}

const ServerConnectionIndicator = ( { isConnected }: Props ) => {
	const translate = useTranslate();

	const status = isConnected
		? translate( 'Server Status: Connected' )
		: translate( 'Server Status: Not connected' );

	const message = isConnected
		? translate( 'One-click restores are enabled.' )
		: // @todo: determine real-time vs daily backup
		  translate( 'Enter your server credentials to enable one-click restores for Daily Backups.' );

	const imgSrc = `/calypso/images/jetpack/jetpack-connection-${ isConnected ? 'good' : 'bad' }.svg`;

	return (
		<Card className="server-connection-indicator">
			<div className="server-connection-indicator__body">
				<div className="server-connection-indicator__image-wrapper">
					<Image src={ imgSrc } />
				</div>

				<div>
					<h4 className="server-connection-indicator__status">{ status }</h4>
					<div className="server-connection-indicator__message">
						<p>{ message }</p>
						{ ! isConnected && (
							<ExternalLink
								href="https://jetpack.com/support/adding-credentials-to-jetpack/"
								target="_blank"
								rel="noopener noreferrer"
								icon={ true }
							>
								{ translate( 'Find your server credentials' ) }
							</ExternalLink>
						) }
					</div>
				</div>
			</div>
		</Card>
	);
};

export default ServerConnectionIndicator;
