import { Button, CompactCard } from '@automattic/components';
import React from 'react';
import { getTelegramConnectionDescription } from '../telegram/get-telegram-connection-description';
import { useTelegramBotWidget } from '../telegram/use-telegram-bot-widget';
import telegramLogo from './telegram-logo.svg';
import '../social-login/style.scss';
import './style.scss';

export default function TelegramConnection() {
	const { translate, isConfigured, isConnected, isStatusReady, containerRef, handleDisconnect } =
		useTelegramBotWidget();

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
		<CompactCard className="dolly__telegram-connection">
			<div className="social-login__header">
				<div className="social-login__header-info">
					<div className="social-login__header-icon">
						<img
							className="dolly__telegram-logo"
							src={ telegramLogo }
							alt=""
							width={ 30 }
							height={ 30 }
							draggable={ false }
						/>
					</div>
					<h3>{ translate( 'Telegram' ) }</h3>
				</div>

				<div className="social-login__header-action dolly__telegram-header-action">
					{ renderConnectAction() }
				</div>
			</div>

			<div className="dolly__telegram-connection-description">
				{ getTelegramConnectionDescription( {
					isStatusReady,
					isConnected,
					connectedDescription: translate( 'Your account is {{strong}}connected{{/strong}}.', {
						components: {
							strong: <span className="dolly__telegram-connected-word" />,
						},
					} ),
				} ) }
			</div>
		</CompactCard>
	);
}
