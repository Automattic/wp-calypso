import { useEffect } from 'react';

interface Props {
	chatKey: string | false;
}

const ZendeskChat = ( { chatKey }: Props ) => {
	useEffect( () => {
		if ( ! chatKey ) {
			return;
		}

		const script = document.createElement( 'script' );
		script.src = 'https://static.zdassets.com/ekr/snippet.js?key=' + encodeURIComponent( chatKey );
		script.type = 'text/javascript';
		script.id = 'ze-snippet';

		const container = document.getElementById( 'zendesk-chat-container' );
		if ( container ) {
			container.appendChild( script );
		}
	}, [ chatKey ] );

	return <div id="zendesk-chat-container" />;
};

export default ZendeskChat;
