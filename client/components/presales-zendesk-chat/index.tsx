import { loadScript } from '@automattic/load-script';
import { useEffect } from 'react';

interface Props {
	chatKey: string | false;
	zendeskdJwt: string | null;
}

const ZendeskChat = ( { chatKey, zendeskdJwt }: Props ) => {
	useEffect( () => {
		if ( ! chatKey ) {
			return;
		}

		const result = loadScript(
			'https://static.zdassets.com/ekr/snippet.js?key=' + encodeURIComponent( chatKey ),
			undefined,
			{ id: 'ze-snippet' }
		);

		Promise.resolve( result ).then( () => {
			if ( typeof window !== 'undefined' ) {
				window.zE = window.zE || [];

				if ( zendeskdJwt && typeof window.zE === 'function' ) {
					window.zE( 'messenger', 'loginUser', function ( callback ) {
						callback( zendeskdJwt );
					} );
				}
			}
		} );
	}, [ chatKey ] );

	return null;
};

export default ZendeskChat;
