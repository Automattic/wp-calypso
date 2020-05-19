/*
 * This function creates a stub `Connection` object that dynamically loads the chunk
 * with the `happychat/connection` library only after the first method call.
 */
export default function buildConnection() {
	// Promise with a lazy initialized `Connection`
	let connection = null;

	// Async load the connection library and return a promise with its default export.
	// That's a factory function that creates and returns the `Connection` class instance.
	function importConnectionLib() {
		return new Promise( ( resolve ) => asyncRequire( 'lib/happychat/connection', resolve ) );
	}

	function getConnection() {
		if ( ! connection ) {
			connection = importConnectionLib().then( ( createConnection ) => createConnection() );
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
