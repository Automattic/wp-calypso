import { Button } from '@automattic/components';
import { loadScript } from '@automattic/load-script';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';

import './style.scss';

export default function OverviewSidebarContactSupport() {
	const translate = useTranslate();
	const [ isZendeskScriptLoaded, setIsZendeskScriptLoaded ] = useState( false );

	const openZendeskChat = () => {
		window.zE( 'messenger', 'open' );
		window.zE( 'messenger', 'show' );
	};

	useEffect( () => {
		if ( isZendeskScriptLoaded ) {
			return;
		}

		const onZendeskScriptLoaded = ( retryCount = 0 ) => {
			// Ensure the Zendesk script is loaded before trying to interact with it.
			if ( typeof window.zE !== 'function' ) {
				if ( retryCount < 5 ) {
					setTimeout( onZendeskScriptLoaded, 250, ++retryCount );
				}
				return;
			}
			// Hide the chat widget by default.
			window.zE( 'messenger', 'hide' );
			setIsZendeskScriptLoaded( true );
		};

		loadScript(
			'https://static.zdassets.com/ekr/snippet.js?key=faa5ee86-ed89-40dc-96f3-ff1d10389bcc',
			onZendeskScriptLoaded,
			{ id: 'ze-snippet' }
		);
	}, [ isZendeskScriptLoaded ] );

	return (
		<>
			<Button className="overview__contact-support-button" onClick={ openZendeskChat }>
				{ translate( 'Contact Support' ) }
			</Button>
		</>
	);
}
