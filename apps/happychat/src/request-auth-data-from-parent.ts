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

const unresponsiveParentError = new Error(
	`Parent window didn't respond to authentication requests.`
);

const parent = window.opener || window.parent;

export function requestDataFromParent(): Promise< HappyChatAuthData > {
	if ( ! parent ) {
		throw new Error( 'This is not running neither inside an iframe or a popup.' );
	}
	return new Promise( function ( resolve, reject ) {
		// Give the parent 5 seconds to respond, throw after then.
		// It's 5 seconds because the parent will need to issue a request to /me.
		const timeout = setTimeout( reject, 5000, unresponsiveParentError );

		function handler( event: MessageEvent ) {
			if ( event.data?.type === 'happy-chat-authentication-data' ) {
				resolve( event.data.authData );
				window.removeEventListener( 'message', handler );
				clearTimeout( timeout );
			}
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
