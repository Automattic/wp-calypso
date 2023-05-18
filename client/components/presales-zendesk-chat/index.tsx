import { loadScript } from '@automattic/load-script';
import { useEffect } from 'react';

interface Props {
	chatKey: string | false;
}

const ZENDESK_SCRIPT_ID = 'ze-snippet';

const ZendeskChat = ( { chatKey }: Props ) => {
	useEffect( () => {
		if ( ! chatKey ) {
			return;
		}

		if ( document.getElementById( ZENDESK_SCRIPT_ID ) ) {
			return;
		}

		loadScript(
			'https://static.zdassets.com/ekr/snippet.js?key=' + encodeURIComponent( chatKey ),
			undefined,
			{ id: ZENDESK_SCRIPT_ID }
		);
	}, [ chatKey ] );

	return null;
};

export default ZendeskChat;
