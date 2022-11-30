import { useEffect } from 'react';

interface Props {
	chatId: string | false;
}

const ZendeskChat = ( { chatId }: Props ) => {
	useEffect( () => {
		if ( ! chatId ) {
			return;
		}

		const script = document.createElement( 'script' );
		script.src = 'https://static.zdassets.com/ekr/snippet.js?key=' + encodeURIComponent( chatId );
		script.type = 'text/javascript';
		script.id = 'ze-snippet';

		const container = document.getElementById( 'zendesk-chat-container' );
		if ( container ) {
			container.appendChild( script );
		}
	}, [ chatId ] );

	return <div id="zendesk-chat-container" />;
};

export default ZendeskChat;
