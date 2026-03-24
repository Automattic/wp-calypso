import { Button, CompactCard } from '@automattic/components';
import React from 'react';
import { useTelegramDollyWidget } from '../telegram/use-telegram-dolly-widget';
import './style.scss';

export default function TelegramConnection() {
	const { translate, isConfigured, isConnected, isStatusReady, containerRef, handleDisconnect } =
		useTelegramDollyWidget();

	if ( ! isConfigured ) {
		return null;
	}

	const renderConnectAction = () => {
		if ( ! isStatusReady ) {
			return null;
		}
		if ( isConnected ) {
			return (
				<Button compact onClick={ handleDisconnect }>
					{ translate( 'Disconnect' ) }
				</Button>
			);
		}

		return <div ref={ containerRef } />;
	};

	return (
		<CompactCard className="ai-assistant__telegram-connection">
			<div className="ai-assistant__telegram-connection-header">
				<div className="ai-assistant__telegram-connection-title">{ translate( 'Telegram' ) }</div>
				<div className="ai-assistant__telegram-connection-action">{ renderConnectAction() }</div>
			</div>

			<div className="ai-assistant__telegram-connection-description">
				{ isStatusReady && isConnected
					? translate( 'Your account is {{strong}}connected{{/strong}} to Telegram.', {
							components: {
								strong: <span className="ai-assistant__telegram-connected-word" />,
							},
					  } )
					: translate( 'Connect Telegram to enable AI Assistant features on your account.' ) }
			</div>
		</CompactCard>
	);
}
