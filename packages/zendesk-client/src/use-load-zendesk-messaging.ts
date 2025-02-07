/**
 * External Dependencies
 */
import { loadScript } from '@automattic/load-script';
import { useEffect, useState } from '@wordpress/element';
/**
 * Internal Dependencies
 */
import {
	ZENDESK_SCRIPT_ID,
	ZENDESK_STAGING_SUPPORT_CHAT_KEY,
	ZENDESK_SUPPORT_CHAT_KEY,
} from './constants';
import { useAuthenticateZendeskMessaging } from './use-authenticate-zendesk-messaging';
import { isTestModeEnvironment } from './util';

export function useLoadZendeskMessaging( enabled = false, tryAuthenticating = false ) {
	const [ isMessagingScriptLoaded, setMessagingScriptLoaded ] = useState( false );
	const isTestMode = isTestModeEnvironment();
	const zendeskKey = isTestMode ? ZENDESK_STAGING_SUPPORT_CHAT_KEY : ZENDESK_SUPPORT_CHAT_KEY;
	const { data: authData } = useAuthenticateZendeskMessaging(
		isMessagingScriptLoaded && tryAuthenticating,
		'messenger'
	);
	useEffect( () => {
		if ( ! enabled || isMessagingScriptLoaded ) {
			return;
		}

		function setUpMessagingEventHandlers( retryCount = 0 ) {
			if ( typeof window.zE !== 'function' ) {
				if ( retryCount < 5 ) {
					setTimeout( setUpMessagingEventHandlers, 250, ++retryCount );
				}
				return;
			}
			window.zE( 'messenger', 'hide' );
			setMessagingScriptLoaded( true );
		}

		loadScript(
			'https://static.zdassets.com/ekr/snippet.js?key=' + encodeURIComponent( zendeskKey ),
			setUpMessagingEventHandlers,
			{ id: ZENDESK_SCRIPT_ID }
		);
	}, [ setMessagingScriptLoaded, enabled, zendeskKey, isMessagingScriptLoaded ] );

	if (
		typeof document !== 'undefined' &&
		document.getElementById( ZENDESK_SCRIPT_ID ) &&
		enabled &&
		typeof window.zE === 'function' &&
		isMessagingScriptLoaded === false
	) {
		setMessagingScriptLoaded( true );
	}

	return {
		isLoggedIn: authData?.isLoggedIn,
		isMessagingScriptLoaded,
	};
}
