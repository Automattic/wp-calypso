const pinghubConnections = {};

function pinghubConnect( { path }, callback ) {
	if ( pinghubConnections[ path ] ) {
		callback( { body: { type: 'error', text: 'already subscribed' }, code: 444 } );
		return;
	}

	const ws = new window.WebSocket( 'wss://public-api.wordpress.com' + path );
	pinghubConnections[ path ] = ws;

	ws.onopen = function () {
		callback( { body: { type: 'open' }, code: 207 } );
	};

	ws.onclose = function () {
		delete pinghubConnections[ path ];
		callback( { body: { type: 'close' }, code: 200 } );
	};

	ws.onerror = function () {
		delete pinghubConnections[ path ];
		callback( { body: { type: 'error' }, code: 500 } );
	};

	ws.onmessage = function ( e ) {
		callback( { body: { type: 'message', data: e.data }, code: 207 } );
	};
}

function pinghubDisconnect( { path }, callback ) {
	const ws = pinghubConnections[ path ];
	if ( ! ws ) {
		callback( { body: { type: 'error', data: 'not connected' }, code: 200 } );
		return;
	}

	ws.close();
	delete pinghubConnections[ path ];
	callback( { body: { type: 'disconnect' }, code: 200 } );
}

function pinghubSend( { path, message }, callback ) {
	const ws = pinghubConnections[ path ];
	if ( ! ws ) {
		callback( { body: { type: 'error' }, code: 404 } );
		return;
	}

	try {
		ws.send( message );
		callback( { body: { type: 'sent' }, code: 201 } );
	} catch ( e ) {
		callback( { body: { type: 'error' }, code: 600 } );
	}
}

export default function handlePinghubMessage( params, callback ) {
	switch ( params.action ) {
		case 'connect':
			pinghubConnect( params, callback );
			break;
		case 'disconnect':
			pinghubDisconnect( params, callback );
			break;

		case 'send':
			pinghubSend( params, callback );
			break;
	}
}
