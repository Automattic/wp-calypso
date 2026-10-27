import { Button, CompactCard } from '@automattic/components';
import React from 'react';
import { useSelector } from 'react-redux';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import { getTelegramConnectionDescription } from '../telegram/get-telegram-connection-description';
import { useTelegramBotWidget } from '../telegram/use-telegram-bot-widget';
import telegramLogo from './telegram-logo.svg';
import '../social-login/style.scss';
import './style.scss';

export default function TelegramConnection() {
	const {
		translate,
		isConfigured,
		isConnected,
		isStatusReady,
		containerRef,
		handleDisconnect,
		pendingAuth,
		isConnecting,
		handleConnect,
		handleCancel,
	} = useTelegramBotWidget();

	const username = useSelector( getCurrentUserName );

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

			{ pendingAuth && (
				<div>
					<p>
						{ translate( 'Allow Telegram to connect to your WordPress.com account %(username)s?', {
							args: { username: username || '' },
						} ) }
					</p>
					<p>
						{ translate( 'Telegram account: %(name)s (ID: %(id)s)', {
							args: {
								name: pendingAuth.username
									? `@${ pendingAuth.username }`
									: pendingAuth.first_name || '',
								id: String( pendingAuth.id ),
							},
						} ) }
					</p>
					<Button disabled={ isConnecting } onClick={ handleCancel }>
						{ translate( 'Cancel' ) }
					</Button>
					<Button primary disabled={ isConnecting } busy={ isConnecting } onClick={ handleConnect }>
						{ translate( 'Connect' ) }
					</Button>
				</div>
			) }
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
