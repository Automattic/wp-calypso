import config from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import wpcom from 'calypso/lib/wp';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

export type TelegramAuthPayload = {
	id: number;
	first_name?: string;
	last_name?: string;
	username?: string;
	photo_url?: string;
	auth_date: number;
	hash: string;
};

type UseTelegramDollyWidgetArgs = {
	trackAuthCallback?: ( user: TelegramAuthPayload ) => void;
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

export function useTelegramDollyWidget( args: UseTelegramDollyWidgetArgs = {} ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { trackAuthCallback } = args;

	const containerRef = useRef< HTMLDivElement | null >( null );
	const injectedContainerRef = useRef< HTMLDivElement | null >( null );

	const [ isConnected, setIsConnected ] = useState( false );
	/** When false, status has not been fetched yet — do not show widget or assume disconnected. */
	const [ isStatusReady, setIsStatusReady ] = useState( false );

	const { botUsername, authUrl, requestAccess, size, showUserpic } = useMemo(
		getWidgetSettings,
		[]
	);

	const isConfigured = Boolean( botUsername );
	const authMode = authUrl ? 'redirect' : 'callback';

	const setConnectedTrue = useCallback( () => setIsConnected( true ), [] );

	useEffect( () => {
		if ( ! isConfigured || isConnected || ! isStatusReady ) {
			return;
		}

		window.dollyOnTelegramAuth = ( user ) => {
			trackAuthCallback?.( user );

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

		// Defer injection so the container div is committed to the DOM.
		const timeoutId = window.setTimeout( () => {
			const container = containerRef.current;
			if ( ! container ) {
				return;
			}

			injectedContainerRef.current = container;
			container.innerHTML = '';

			const script = document.createElement( 'script' );
			script.async = true;
			// Cache-bust so the widget re-initializes after disconnect.
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
		isStatusReady,
		translate,
		setConnectedTrue,
		botUsername,
		authUrl,
		authMode,
		requestAccess,
		size,
		showUserpic,
		trackAuthCallback,
	] );

	// Fetch connection status before showing the widget (avoids flashing the widget when already connected).
	useEffect( () => {
		if ( ! isConfigured ) {
			return;
		}

		let cancelled = false;

		wpcom.req
			.get( { path: '/telegram-bot/status', apiNamespace: 'wpcom/v2' } )
			.then( ( data: { connected?: boolean; telegram_user_id?: number | string } ) => {
				if ( cancelled ) {
					return;
				}
				if ( data?.connected || data?.telegram_user_id != null ) {
					setIsConnected( true );
				}
			} )
			.catch( () => {
				// Treat as not connected; show widget after ready.
			} )
			.finally( () => {
				if ( ! cancelled ) {
					setIsStatusReady( true );
				}
			} );

		return () => {
			cancelled = true;
		};
	}, [ isConfigured ] );

	const handleDisconnect = useCallback( () => {
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
	}, [ dispatch, translate ] );

	return {
		translate,
		isConfigured,
		isConnected,
		isStatusReady,
		containerRef,
		handleDisconnect,
	} as const;
}
