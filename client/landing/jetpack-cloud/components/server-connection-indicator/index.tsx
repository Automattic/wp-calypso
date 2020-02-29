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
	// backupType: 'daily' | 'realtime';
}

const ServerConnectionIndicator = ( { isConnected }: Props ) => {
	const translate = useTranslate();

	const getStatus = () =>
		isConnected
			? translate( 'Server Status: Connected' )
			: translate( 'Server Status: Not connected' );

	const imgSrc = `/calypso/images/jetpack/jetpack-connection-${ isConnected ? 'good' : 'bad' }.svg`;

	return (
		<Card className="server-connection-indicator">
			<div className="server-connection-indicator__body">
				<div className="server-connection-indicator__image-wrapper">
					<Image className="server-connection-indicator__image" src={ imgSrc } />
				</div>

				<div className="server-connection-indicator__info">
					<h4 className="server-connection-indicator__status">{ getStatus() }</h4>
				</div>
			</div>
		</Card>
	);
};

export default ServerConnectionIndicator;
