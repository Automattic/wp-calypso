import config from '@automattic/calypso-config';
import { Button, Notice, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { useMcpTracksAudienceProps } from '../../../me/mcp/tracks';
import { useAnalytics } from '../../app/analytics';
import { agentRoute } from '../../app/router/me';
import ComponentViewTracker from '../../components/component-view-tracker';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import WordPressAgentEmail from '../mcp/wordpress-agent-email';
import WordPressAgentSlack from '../mcp/wordpress-agent-slack';
import WordPressAgentTelegram from '../mcp/wordpress-agent-telegram';
import SlackPairing from './slack-pairing';
import TelegramPairing from './telegram-pairing';

import './style.scss';

type PendingConnection =
	| { type: 'slack'; pairToken: string }
	| { type: 'telegram'; telegramId: string; token: string; timestamp: string; bot?: string };

interface ConnectionCallbacks {
	pairToken?: string;
	slackStatus?: string;
	telegramId?: string;
	telegramToken?: string;
	telegramTimestamp?: string;
	telegramBot?: string;
}

function getPendingConnection( callbacks: ConnectionCallbacks ): PendingConnection | undefined {
	if ( callbacks.pairToken && config.isEnabled( 'wordpress-agent-slack' ) ) {
		return { type: 'slack', pairToken: callbacks.pairToken };
	}

	if (
		callbacks.telegramId &&
		callbacks.telegramToken &&
		callbacks.telegramTimestamp &&
		config.isEnabled( 'dolly/telegram' )
	) {
		return {
			type: 'telegram',
			telegramId: callbacks.telegramId,
			token: callbacks.telegramToken,
			timestamp: callbacks.telegramTimestamp,
			bot: callbacks.telegramBot,
		};
	}
}

function getTelegramBotUrl( bot?: string ) {
	return bot ? `https://t.me/${ encodeURIComponent( bot ) }` : undefined;
}

export default function WordPressAgent() {
	const { recordTracksEvent } = useAnalytics();
	const tracksAudienceProps = useMcpTracksAudienceProps();
	const {
		pair_token: pairTokenParam,
		slack: slackStatusParam,
		telegram_id: telegramIdParam,
		token: telegramTokenParam,
		ts: telegramTimestampParam,
		bot: telegramBotParam,
	} = agentRoute.useSearch();
	const [ connectionCallbacks ] = useState< ConnectionCallbacks >( () => ( {
		pairToken: pairTokenParam,
		slackStatus: slackStatusParam,
		telegramId: telegramIdParam,
		telegramToken: telegramTokenParam,
		telegramTimestamp: telegramTimestampParam,
		telegramBot: telegramBotParam,
	} ) );
	const [ pendingConnection ] = useState( () => getPendingConnection( connectionCallbacks ) );
	const [ pairingResult, setPairingResult ] = useState< 'connected' | 'dismissed' | null >( null );

	useEffect( () => {
		if ( ! Object.values( connectionCallbacks ).some( Boolean ) ) {
			return;
		}

		const url = new URL( window.location.href );
		[ 'pair_token', 'slack', 'telegram_id', 'token', 'ts', 'bot' ].forEach( ( parameter ) =>
			url.searchParams.delete( parameter )
		);
		window.history.replaceState( window.history.state, '', url.toString() );
	}, [ connectionCallbacks ] );

	if ( pendingConnection && ! pairingResult ) {
		const dismiss = () => {
			recordTracksEvent( 'calypso_dashboard_wordpress_agent_pairing_dismiss', {
				...tracksAudienceProps,
				channel: pendingConnection.type,
			} );
			setPairingResult( 'dismissed' );
		};

		return (
			<PageLayout
				size="small"
				header={
					<PageHeader
						title={
							pendingConnection.type === 'slack'
								? __( 'Connect WordPress Agent to Slack' )
								: __( 'Connect WordPress Agent to Telegram' )
						}
						description={
							pendingConnection.type === 'slack'
								? __(
										'Approve the connection below to use your WordPress.com sites when you message WordPress Agent in Slack.'
								  )
								: __(
										'Approve the connection below to use your WordPress.com sites when you message WordPress Agent on Telegram.'
								  )
						}
					/>
				}
			>
				<ComponentViewTracker
					eventName="calypso_dashboard_wordpress_agent_pairing_view"
					properties={ { ...tracksAudienceProps, channel: pendingConnection.type } }
				/>
				{ pendingConnection.type === 'slack' ? (
					<SlackPairing
						pairToken={ pendingConnection.pairToken }
						onConnected={ () => setPairingResult( 'connected' ) }
						onCancel={ dismiss }
					/>
				) : (
					<TelegramPairing
						telegramId={ pendingConnection.telegramId }
						token={ pendingConnection.token }
						timestamp={ pendingConnection.timestamp }
						bot={ pendingConnection.bot }
						onConnected={ () => setPairingResult( 'connected' ) }
						onCancel={ dismiss }
					/>
				) }
			</PageLayout>
		);
	}

	const hasTelegramCallbackParam = Boolean(
		connectionCallbacks.telegramId ||
			connectionCallbacks.telegramToken ||
			connectionCallbacks.telegramTimestamp ||
			connectionCallbacks.telegramBot
	);
	const hasInvalidTelegramLink =
		config.isEnabled( 'dolly/telegram' ) &&
		hasTelegramCallbackParam &&
		! (
			connectionCallbacks.telegramId &&
			connectionCallbacks.telegramToken &&
			connectionCallbacks.telegramTimestamp
		);
	const telegramBotUrl = getTelegramBotUrl( connectionCallbacks.telegramBot );

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'WordPress Agent' ) }
					description={ __(
						'WordPress Agent helps you manage your site, create content, and monitor performance. Message your agent from where it’s convenient: via Telegram, Email, or Slack.'
					) }
				/>
			}
		>
			<ComponentViewTracker
				eventName="calypso_dashboard_wordpress_agent_connections_view"
				properties={ tracksAudienceProps }
			/>
			<VStack spacing={ 8 }>
				{ pairingResult === 'connected' && pendingConnection?.type === 'slack' && (
					<Notice status="success" isDismissible={ false }>
						{ __( 'Your Slack account is connected.' ) }
					</Notice>
				) }
				{ pairingResult === 'connected' && pendingConnection?.type === 'telegram' && (
					<Notice status="success" isDismissible={ false }>
						{ __( 'Telegram connected successfully.' ) }
						{ telegramBotUrl && (
							<Button variant="link" href={ telegramBotUrl } target="_blank" rel="noreferrer">
								{ __( 'Open Telegram' ) }
							</Button>
						) }
					</Notice>
				) }
				{ hasInvalidTelegramLink && (
					<Notice status="error" isDismissible={ false }>
						{ __( 'This Telegram connection link is invalid or incomplete.' ) }
					</Notice>
				) }
				<WordPressAgentEmail />
				{ config.isEnabled( 'dolly/telegram' ) && <WordPressAgentTelegram /> }
				{ config.isEnabled( 'wordpress-agent-slack' ) && (
					<WordPressAgentSlack slackStatus={ connectionCallbacks.slackStatus } />
				) }
			</VStack>
		</PageLayout>
	);
}
