/**
 * External Dependencies
 */
import config from '@automattic/calypso-config';
import { loadScript } from '@automattic/load-script';
import { useEffect, useState } from '@wordpress/element';
/**
 * Internal Dependencies
 */
import { ZENDESK_SCRIPT_ID } from './constants';
import { useAuthenticateZendeskMessaging } from './use-authenticate-zendesk-messaging';
import type { ZendeskConfigName } from './types';

export function useLoadZendeskMessaging(
	keyConfigName: ZendeskConfigName,
	enabled = false,
	tryAuthenticating = false,
	shouldUseHelpCenterExperience = false
) {
	const [ isMessagingScriptLoaded, setMessagingScriptLoaded ] = useState( false );
	const zendeskKey: string = config( keyConfigName );
	const { data: authData } = useAuthenticateZendeskMessaging(
		isMessagingScriptLoaded && tryAuthenticating,
		shouldUseHelpCenterExperience ? 'messenger' : 'zendesk'
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
