import { loadScript } from '@automattic/load-script';
import { useEffect } from 'react';

interface Props {
	chatKey: string | false;
}

const ZendeskChat = ( { chatKey }: Props ) => {
	useEffect( () => {
		if ( ! chatKey ) {
			return;
		}

		loadScript(
			'https://static.zdassets.com/ekr/snippet.js?key=' + encodeURIComponent( chatKey ),
			() => {
				return null;
			},
			{ id: 'ze-snippet' }
		);
	}, [ chatKey ] );

	return null;
};

export default ZendeskChat;
