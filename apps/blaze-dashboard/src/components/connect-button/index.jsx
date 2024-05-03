import config from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import React from 'react';

const ConnectButton = () => {
	const translate = useTranslate();

	const showConnect = config( 'need_setup' ) === 'disconnected';
	const connectUrl = window?.configData?.connect_url;

	const handleConnect = () => {
		window.location.href = connectUrl;
	};

	return showConnect ? (
		<button className="woo-blaze__connect-button" onClick={ handleConnect }>
			{ translate( 'Connect now' ) }
		</button>
	) : null;
};

export default ConnectButton;
