import {
	wordpressAgentTelegramConnectMutation,
	wordpressAgentTelegramDisconnectMutation,
	wordpressAgentTelegramStatusQuery,
	wordpressAgentTelegramTokenConnectMutation,
} from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Notice, Spinner } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useAuth } from '../../app/auth';
import { Card, CardBody } from '../../components/card';
import { SectionHeader } from '../../components/section-header';
import type { WordPressAgentTelegramAuthPayload } from '@automattic/api-core';

interface WordPressAgentTelegramProps {
	telegramId?: string;
	token?: string;
	timestamp?: string;
	bot?: string;
}

declare global {
	interface Window {
		wordpressAgentOnTelegramAuth?: ( payload: WordPressAgentTelegramAuthPayload ) => void;
	}
}

const TELEGRAM_WIDGET_SRC = 'https://telegram.org/js/telegram-widget.js?22';

function getErrorMessage( error: unknown, fallback: string ): string {
	return error instanceof Error && error.message ? error.message : fallback;
}

function getTelegramBotUrl( bot?: string ) {
	return bot ? `https://t.me/${ encodeURIComponent( bot ) }` : undefined;
}

export default function WordPressAgentTelegram( {
	telegramId,
	token,
	timestamp,
	bot,
}: WordPressAgentTelegramProps ) {
	const { recordTracksEvent } = useAnalytics();
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const containerRef = useRef< HTMLDivElement | null >( null );
	const injectedContainerRef = useRef< HTMLDivElement | null >( null );
	const [ pairingDismissed, setPairingDismissed ] = useState( false );
	const [ pairingComplete, setPairingComplete ] = useState( false );
	const statusQuery = useQuery( wordpressAgentTelegramStatusQuery() );
	const connectMutation = useMutation( wordpressAgentTelegramConnectMutation( queryClient ) );
	const connectTelegram = connectMutation.mutate;
	const tokenMutation = useMutation( wordpressAgentTelegramTokenConnectMutation( queryClient ) );
	const disconnectMutation = useMutation( wordpressAgentTelegramDisconnectMutation( queryClient ) );

	const botUsername = config( 'dolly_telegram_bot_username' ) as unknown as string | undefined;
	const authUrl = config( 'dolly_telegram_auth_url' ) as unknown as string | undefined;
	const requestAccess = config( 'dolly_telegram_request_access' ) as unknown as 'write' | undefined;
	const configuredSize = config( 'dolly_telegram_widget_size' ) as unknown as
		| 'large'
		| 'medium'
		| 'small'
		| undefined;
	const showUserpic = Boolean(
		config( 'dolly_telegram_show_userpic' ) as unknown as boolean | undefined
	);
	const widgetSettings = useMemo(
		() => ( {
			botUsername,
			authUrl,
			requestAccess,
			size: configuredSize || 'large',
			showUserpic,
		} ),
		[ botUsername, authUrl, requestAccess, configuredSize, showUserpic ]
	);
	const isConfigured = Boolean( widgetSettings.botUsername );
	const isStatusReady = ! statusQuery.isLoading;
	const isConnected = Boolean(
		statusQuery.data?.connected || statusQuery.data?.telegram_user_id != null
	);
	const hasAnyCallbackParam = Boolean( telegramId || token || timestamp || bot );
	const hasCompleteCallback = Boolean( telegramId && token && timestamp );
	const displayName = user.display_name;
	const username =
		displayName && user.username && displayName !== user.username
			? `${ displayName } (@${ user.username })`
			: displayName || user.username;
	const pairingTitle = username
		? sprintf(
				/* translators: %s is the WordPress.com user's display name and/or username. */
				__( 'Connect your WordPress.com account %s to Telegram?' ),
				username
		  )
		: __( 'Connect your WordPress.com account to Telegram?' );

	useEffect( () => {
		if ( ! isConfigured || isConnected || ! isStatusReady ) {
			return;
		}

		window.wordpressAgentOnTelegramAuth = ( payload ) => {
			recordTracksEvent( 'calypso_dolly_telegram_widget_auth_callback', {
				has_username: payload.username ? 1 : 0,
				auth_date: payload.auth_date,
			} );
			connectTelegram( payload );
		};

		const timeoutId = window.setTimeout( () => {
			const container = containerRef.current;
			if ( ! container ) {
				return;
			}

			injectedContainerRef.current = container;
			container.innerHTML = '';
			const script = document.createElement( 'script' );
			script.async = true;
			script.src = `${ TELEGRAM_WIDGET_SRC }&_=${ Date.now() }`;
			script.setAttribute( 'data-telegram-login', widgetSettings.botUsername as string );
			script.setAttribute( 'data-size', widgetSettings.size );
			script.setAttribute( 'data-userpic', widgetSettings.showUserpic ? 'true' : 'false' );
			script.setAttribute( 'data-onauth', 'wordpressAgentOnTelegramAuth(user)' );

			if ( widgetSettings.authUrl ) {
				script.setAttribute( 'data-auth-url', widgetSettings.authUrl );
			}
			if ( widgetSettings.requestAccess ) {
				script.setAttribute( 'data-request-access', widgetSettings.requestAccess );
			}

			container.appendChild( script );
		}, 0 );

		return () => {
			window.clearTimeout( timeoutId );
			if ( injectedContainerRef.current ) {
				injectedContainerRef.current.innerHTML = '';
				injectedContainerRef.current = null;
			}
			delete window.wordpressAgentOnTelegramAuth;
		};
	}, [
		connectTelegram,
		isConfigured,
		isConnected,
		isStatusReady,
		recordTracksEvent,
		widgetSettings,
	] );

	if ( ! isConfigured ) {
		return null;
	}

	const connectViaToken = () => {
		if ( ! telegramId || ! token || ! timestamp ) {
			return;
		}

		tokenMutation.mutate(
			{
				telegram_id: telegramId,
				token,
				ts: timestamp,
				...( bot && { bot } ),
			},
			{
				onSuccess: () => {
					recordTracksEvent( 'calypso_telegram_connect_via_token_success', {
						source: 'calypso_token',
					} );
					setPairingComplete( true );
				},
				onError: ( error ) => {
					recordTracksEvent( 'calypso_telegram_connect_via_token_error', {
						source: 'calypso_token',
						error: error.message || 'unknown',
					} );
				},
			}
		);
	};

	const disconnect = () => {
		disconnectMutation.mutate( undefined, {
			onSuccess: () => {
				recordTracksEvent( 'calypso_wordpress_agent_telegram_disconnect' );
				connectMutation.reset();
				tokenMutation.reset();
				setPairingComplete( false );
			},
		} );
	};

	const error =
		statusQuery.error || connectMutation.error || tokenMutation.error || disconnectMutation.error;
	let errorFallback: string = __( 'Could not load your Telegram connection.' );
	if ( connectMutation.error || tokenMutation.error ) {
		errorFallback = __( 'Failed to connect Telegram. Please try again.' );
	} else if ( disconnectMutation.error ) {
		errorFallback = __( 'Failed to disconnect Telegram. Please try again.' );
	}

	return (
		<>
			{ hasAnyCallbackParam && ! hasCompleteCallback && (
				<Notice status="error" isDismissible={ false }>
					{ __( 'This Telegram connection link is invalid or incomplete.' ) }
				</Notice>
			) }
			{ hasCompleteCallback && ! pairingDismissed && ! pairingComplete && (
				<Card>
					<CardBody className="wordpress-agent-connection__row">
						<SectionHeader
							level={ 3 }
							title={ pairingTitle }
							description={ __(
								'Connect your account to use WordPress Agent when you message it in Telegram.'
							) }
						/>
						<div className="wordpress-agent-connection__actions">
							<Button
								__next40pxDefaultSize
								variant="secondary"
								onClick={ () => setPairingDismissed( true ) }
							>
								{ __( 'Cancel' ) }
							</Button>
							<Button
								__next40pxDefaultSize
								variant="primary"
								onClick={ connectViaToken }
								isBusy={ tokenMutation.isPending }
								disabled={ tokenMutation.isPending }
							>
								{ __( 'Connect' ) }
							</Button>
						</div>
					</CardBody>
				</Card>
			) }
			{ pairingComplete && (
				<Notice status="success" isDismissible={ false }>
					{ __( 'Telegram connected successfully.' ) }
					{ getTelegramBotUrl( bot ) && (
						<Button
							variant="link"
							href={ getTelegramBotUrl( bot ) }
							target="_blank"
							rel="noreferrer"
						>
							{ __( 'Open Telegram' ) }
						</Button>
					) }
				</Notice>
			) }
			{ connectMutation.isSuccess && (
				<Notice status="success" isDismissible={ false }>
					{ __( 'Telegram connected successfully.' ) }
				</Notice>
			) }
			{ error && (
				<Notice status="error" isDismissible={ false }>
					{ getErrorMessage( error, errorFallback ) }
				</Notice>
			) }
			<Card>
				<CardBody className="wordpress-agent-connection__row">
					<SectionHeader
						level={ 3 }
						title={ __( 'Telegram' ) }
						description={ __( 'Message your agent from Telegram for quick updates on the go.' ) }
					/>
					<div className="wordpress-agent-telegram__action">
						{ ! isStatusReady && <Spinner /> }
						{ isStatusReady && isConnected && (
							<Button
								__next40pxDefaultSize
								variant="secondary"
								isDestructive
								onClick={ disconnect }
								isBusy={ disconnectMutation.isPending }
								disabled={ disconnectMutation.isPending }
							>
								{ __( 'Disconnect' ) }
							</Button>
						) }
						{ isStatusReady && ! isConnected && <div ref={ containerRef } /> }
					</div>
				</CardBody>
			</Card>
		</>
	);
}
