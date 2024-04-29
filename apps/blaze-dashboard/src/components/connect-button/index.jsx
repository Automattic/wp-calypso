import config from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import React from 'react';

const ConnectButton = () => {
	const translate = useTranslate();

	const isJetpackConnected = config.isEnabled( 'is_jetpack_connected' );

	const handleConnect = () => {
		window.location.href = window.configData.connect_url;
	};

	return ! isJetpackConnected ? (
		<button className="woo-blaze__connect-button" onClick={ handleConnect }>
			{ translate( 'Connect now' ) }
		</button>
	) : null;
};

export default ConnectButton;
