import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, Card } from '@automattic/components';
import React from 'react';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { getTelegramConnectionDescription } from '../../telegram/get-telegram-connection-description';
import { useTelegramBotWidget, TelegramAuthPayload } from '../../telegram/use-telegram-bot-widget';
import { useHandleClickLink } from './use-handle-click-link';

import './style.scss';

export const DollyCard = () => {
	const handleClickLink = useHandleClickLink();
	const { translate, isConfigured, isConnected, isStatusReady, containerRef, handleDisconnect } =
		useTelegramBotWidget( {
			trackAuthCallback: ( user: TelegramAuthPayload ) =>
				recordTracksEvent( 'calypso_dolly_telegram_widget_auth_callback', {
					has_username: user?.username ? 1 : 0,
					auth_date: user?.auth_date,
				} ),
		} );

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
		<Card className="developer-features-list__item">
			<div className="developer-features-list__item-tag">{ translate( 'New' ) }</div>
			<div className="developer-features-list__item-title">
				{ translate( 'Telegram Bot (alpha)' ) }
			</div>
			<div className="developer-features-list__item-description">
				{ getTelegramConnectionDescription( {
					isStatusReady,
					isConnected,
					connectedDescription: translate( 'Your account is {{strong}}connected{{/strong}}.', {
						components: {
							strong: <span className="developer-features-list__item-connected-word" />,
						},
					} ),
					disconnectedDescription: translate(
						"Connect your WordPress.com account to @wordpressagentbot to publish posts, check stats, find a domain, brainstorm ideas, or fix that typo you've been meaning to get to — all without leaving Telegram."
					),
				} ) }
			</div>
			<div className="developer-features-list__item-learn-more">
				{ renderConnectAction() }
				{ isStatusReady && ! isConnected && (
					<div>
						<InlineSupportLink
							showIcon={ false }
							supportContext="developer-features"
							onClick={ handleClickLink }
						/>
					</div>
				) }
			</div>
		</Card>
	);
};
