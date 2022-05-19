/*
 * This function creates a stub `Connection` object that dynamically loads the chunk
 * with the `happychat/connection` library only after the first method call.
 */
export default function buildConnection(
	receiveAccept,
	receiveConnect,
	receiveDisconnect,
	receiveError,
	receiveInit,
	receiveLocalizedSupport,
	receiveMessage,
	receiveMessageOptimistic,
	receiveMessageUpdate,
	receiveReconnecting,
	receiveStatus,
	receiveToken,
	receiveUnauthorized,
	requestTranscript
) {
	// Promise with a lazy initialized `Connection`
	let connection = null;

	// Async load the connection library and return a promise with its default export.
	// That's a factory function that creates and returns the `Connection` class instance.
	function importConnectionLib() {
		return import(
			/* webpackChunkName: "async-load-calypso-lib-happychat-connection" */ './connection'
		);
	}
	// function importConnectionLib() {
	// 	return import(
	// 		/* webpackChunkName: "async-load-calypso-lib-happychat-connection" */ 'calypso/lib/happychat/connection'
	// 	);
	// }

	function getConnection() {
		if ( ! connection ) {
			connection = importConnectionLib().then( ( { default: createConnection } ) =>
				createConnection(
					receiveAccept,
					receiveConnect,
					receiveDisconnect,
					receiveError,
					receiveInit,
					receiveLocalizedSupport,
					receiveMessage,
					receiveMessageOptimistic,
					receiveMessageUpdate,
					receiveReconnecting,
					receiveStatus,
					receiveToken,
					receiveUnauthorized,
					requestTranscript
				)
			);
		}
		return connection;
	}

	// Forward a method call to the implementation. Works only for methods that return promises,
	// which, fortunately, is the case for all `Connection` methods.
	function forwardMethod( name ) {
		return ( ...args ) => getConnection().then( ( conn ) => conn[ name ]( ...args ) );
	}

	return {
		init: forwardMethod( 'init' ),
		request: forwardMethod( 'request' ),
		send: forwardMethod( 'send' ),
	};
}
