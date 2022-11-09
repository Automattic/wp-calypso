import { useEffect } from 'react';

const ZendeskChat = ( { chatId } ) => {
	useEffect( () => {
		if ( chatId ) {
			const script = document.createElement( 'script' );
			script.src = 'https://static.zdassets.com/ekr/snippet.js?key=' + chatId;
			script.type = 'text/javascript';
			script.id = 'ze-snippet';

			document.getElementById( 'zendesk-chat-container' ).appendChild( script );
		}
	}, [ chatId ] );

	return <div id="zendesk-chat-container" />;
};

export default ZendeskChat;
