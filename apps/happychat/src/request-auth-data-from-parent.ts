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
		// Give the parent one second to respond, which is plenty of time, throw after then.
		// If parent window is prepared to respond, it will probably respond in less than 100ms, if not, there is no reason to wait longer.
		// It may be worth it to poll, though. So far, YAGNI.
		const timeout = setTimeout( reject, 1000, unresponsiveParentError );

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
