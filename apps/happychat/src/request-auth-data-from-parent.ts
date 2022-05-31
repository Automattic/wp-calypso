import { reject } from 'lodash';

type User = {
	ID: number;
	display_name: string;
	username: string;
	avatar_URL: string;
	email: string;
};

type HappyChatAuthData = {
	jwt: string;
	user: User;
};

export function requestDataFromParent(): Promise< HappyChatAuthData > {
	return new Promise( function ( resolve ) {
		function handler( event: MessageEvent ) {
			if ( event.data?.type === 'happy-chat-authentication-data' ) {
				resolve( event.data.authData );
				window.removeEventListener( 'message', handler );
			}
		}
		const parent = window.opener || window.parent;
		if ( ! parent ) {
			return reject( new Error( 'This is not running neither inside an iframe or a popup.' ) );
		}
		parent.postMessage(
			{
				type: 'happy-chat-authentication-data',
			},
			'*'
		);
		window.addEventListener( 'message', handler );
	} );
}
