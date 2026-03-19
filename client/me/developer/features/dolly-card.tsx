import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, Card } from '@automattic/components';
import React from 'react';
import InlineSupportLink from 'calypso/components/inline-support-link';
import {
	useTelegramDollyWidget,
	TelegramAuthPayload,
} from '../../telegram/use-telegram-dolly-widget';
import { useHandleClickLink } from './use-handle-click-link';

import './style.scss';

export const DollyCard = () => {
	const handleClickLink = useHandleClickLink();
	const { translate, isConfigured, isConnected, isStatusReady, containerRef, handleDisconnect } =
		useTelegramDollyWidget( {
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
			<div className="developer-features-list__item-title">{ translate( 'Dolly' ) }</div>
			<div className="developer-features-list__item-description">
				{ isStatusReady && isConnected
					? translate( 'Your account is {{strong}}connected{{/strong}} to Telegram.', {
							components: {
								strong: <span className="developer-features-list__item-connected-word" />,
							},
					  } )
					: translate( 'Connect Dolly to Telegram to start using it with your account.' ) }
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
