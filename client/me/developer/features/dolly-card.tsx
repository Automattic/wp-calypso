import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import InlineSupportLink from 'calypso/components/inline-support-link';
import wpcom from 'calypso/lib/wp';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { useHandleClickLink } from './use-handle-click-link';

import './style.scss';

type TelegramAuthPayload = {
	id: number;
	first_name?: string;
	last_name?: string;
	username?: string;
	photo_url?: string;
	auth_date: number;
	hash: string;
};

declare global {
	interface Window {
		dollyOnTelegramAuth?: ( user: TelegramAuthPayload ) => void;
	}
}

const TELEGRAM_WIDGET_SRC = 'https://telegram.org/js/telegram-widget.js?22';

function getWidgetSettings() {
	const botUsername = config( 'dolly_telegram_bot_username' ) as unknown as string | undefined;
	const authUrl = config( 'dolly_telegram_auth_url' ) as unknown as string | undefined;
	const requestAccess = config( 'dolly_telegram_request_access' ) as unknown as 'write' | undefined;
	const size = ( config( 'dolly_telegram_widget_size' ) as unknown as 'large' | 'medium' | 'small' )
		? ( config( 'dolly_telegram_widget_size' ) as unknown as 'large' | 'medium' | 'small' )
		: 'large';
	const showUserpic = Boolean(
		config( 'dolly_telegram_show_userpic' ) as unknown as boolean | undefined
	);

	return { botUsername, authUrl, requestAccess, size, showUserpic };
}

export const DollyCard = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const handleClickLink = useHandleClickLink();
	const containerRef = useRef< HTMLDivElement | null >( null );
	const injectedContainerRef = useRef< HTMLDivElement | null >( null );
	const [ isConnected, setIsConnected ] = useState( false );

	const { botUsername, authUrl, requestAccess, size, showUserpic } = useMemo(
		getWidgetSettings,
		[]
	);
	const isConfigured = Boolean( botUsername );
	const authMode = authUrl ? 'redirect' : 'callback';

	const setConnectedTrue = useCallback( () => setIsConnected( true ), [] );

	useEffect( () => {
		if ( ! isConfigured || isConnected ) {
			return;
		}

		window.dollyOnTelegramAuth = ( user ) => {
			recordTracksEvent( 'calypso_dolly_telegram_widget_auth_callback', {
				has_username: user?.username ? 1 : 0,
				auth_date: user?.auth_date,
			} );

			wpcom.req
				.post( { path: '/telegram-bot/connect', apiNamespace: 'wpcom/v2' }, user )
				.then( () => {
					dispatch( successNotice( translate( 'Telegram connected successfully.' ) ) );
					setConnectedTrue();
				} )
				.catch( ( err: Error ) => {
					dispatch(
						errorNotice(
							err?.message || translate( 'Failed to connect Telegram. Please try again.' )
						)
					);
				} );
		};

		// Defer injection so the container div is committed to the DOM (ref is set after paint).
		const timeoutId = window.setTimeout( () => {
			const container = containerRef.current;
			if ( ! container ) {
				return;
			}
			injectedContainerRef.current = container;
			container.innerHTML = '';

			const script = document.createElement( 'script' );
			script.async = true;
			// Cache-bust so the widget re-initializes after disconnect (script may already be loaded).
			script.src = `${ TELEGRAM_WIDGET_SRC }&_=${ Date.now() }`;
			script.setAttribute( 'data-telegram-login', botUsername as string );
			script.setAttribute( 'data-size', size );
			script.setAttribute( 'data-userpic', showUserpic ? 'true' : 'false' );
			script.setAttribute( 'data-onauth', 'dollyOnTelegramAuth(user)' );

			if ( authMode === 'redirect' ) {
				script.setAttribute( 'data-auth-url', authUrl as string );
			}

			if ( requestAccess ) {
				script.setAttribute( 'data-request-access', requestAccess );
			}

			container.appendChild( script );
		}, 0 );

		return () => {
			window.clearTimeout( timeoutId );
			const containerToClear = injectedContainerRef.current;
			if ( containerToClear ) {
				containerToClear.innerHTML = '';
				injectedContainerRef.current = null;
			}
			if ( window.dollyOnTelegramAuth ) {
				delete window.dollyOnTelegramAuth;
			}
		};
	}, [
		dispatch,
		isConfigured,
		isConnected,
		translate,
		setConnectedTrue,
		botUsername,
		authUrl,
		authMode,
		requestAccess,
		size,
		showUserpic,
	] );

	// On mount, fetch connection status so we show "Connected" if already linked.
	// Backend should implement GET /wpcom/v2/telegram-bot/status by reading
	// wp_user_attributes (meta_key = 'telegram_user_id') for the current user;
	// return { connected: true } or { telegram_user_id: <value> } when set.
	useEffect( () => {
		if ( ! isConfigured || isConnected ) {
			return;
		}
		wpcom.req
			.get( { path: '/telegram-bot/status', apiNamespace: 'wpcom/v2' } )
			.then( ( data: { connected?: boolean; telegram_user_id?: number | string } ) => {
				if ( data?.connected || data?.telegram_user_id != null ) {
					setIsConnected( true );
				}
			} )
			.catch( () => {
				// No status endpoint or not connected; keep widget visible.
			} );
	}, [ isConfigured, isConnected ] );

	if ( ! isConfigured ) {
		return null;
	}

	const handleDisconnect = () => {
		wpcom.req
			.post( { path: '/telegram-bot/disconnect', apiNamespace: 'wpcom/v2' } )
			.then( () => {
				dispatch( successNotice( translate( 'Telegram disconnected.' ) ) );
				setIsConnected( false );
			} )
			.catch( ( err: Error ) => {
				dispatch(
					errorNotice(
						err?.message || translate( 'Failed to disconnect Telegram. Please try again.' )
					)
				);
			} );
	};

	const renderConnectAction = () => {
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
				{ isConnected ? (
					<>
						{ translate( 'Your account is ' ) }
						<span className="developer-features-list__item-connected-word">
							{ translate( 'connected' ) }
						</span>
						{ translate( ' to Telegram.' ) }
					</>
				) : (
					translate( 'Connect Dolly to Telegram to start using it with your account.' )
				) }
			</div>
			<div className="developer-features-list__item-learn-more">
				{ renderConnectAction() }
				{ ! isConnected && (
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
