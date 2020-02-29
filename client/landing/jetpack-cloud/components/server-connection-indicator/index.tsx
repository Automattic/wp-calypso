/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
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

	/* @todo: figure out which type of backup we are */
	// const message = isConnected
	// 	? translate( 'One-click restores are enabled.' )
	// 	: translate(
	// 			'Enter your server credentials to enable one-click restores for [Real-time] Backups.'
	// 	  );

	const message = isConnected
		? translate( 'One-click restores are enabled.' )
		: translate( 'Enter your server credentials to enable one-click restores.' );

	const imgSrc = `/calypso/images/jetpack/jetpack-connection-${ isConnected ? 'good' : 'bad' }.svg`;

	return (
		<Card className="server-connection-indicator">
			<div className="server-connection-indicator__body">
				<div className="server-connection-indicator__image-wrapper">
					<Image className="server-connection-indicator__image" src={ imgSrc } />
				</div>

				<div className="server-connection-indicator__info">
					<h4 className="server-connection-indicator__status">{ status }</h4>
					<p className="server-connection-indicator__message">{ message }</p>
				</div>
			</div>
		</Card>
	);
};

export default ServerConnectionIndicator;
