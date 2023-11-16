/**
 * External Dependencies
 */
import config from '@automattic/calypso-config';
import { loadScript } from '@automattic/load-script';
import { useEffect, useState } from '@wordpress/element';
/**
 * Internal Dependencies
 */
import { useMessagingAuth } from './';

export type ZendeskConfigName =
	| 'zendesk_support_chat_key'
	| 'zendesk_presales_chat_key'
	| 'zendesk_presales_chat_key_akismet'
	| 'zendesk_presales_chat_key_jp_checkout'
	| 'zendesk_presales_chat_key_jp_agency_dashboard';

const ZENDESK_SCRIPT_ID = 'ze-snippet';

export default function useZendeskMessaging(
	keyConfigName: ZendeskConfigName,
	enabled = true,
	tryAuthenticating = true
) {
	const [ isMessagingScriptLoaded, setMessagingScriptLoaded ] = useState( false );
	const zendeskKey: string = config( keyConfigName );
	const { data: authData } = useMessagingAuth( isMessagingScriptLoaded && tryAuthenticating );
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
