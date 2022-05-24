import type { Connection } from './connection';
import type { ConnectionProps } from './types';

/*
 * This function creates a stub `Connection` object that dynamically loads the chunk
 * with the `happychat/connection` library only after the first method call.
 */
export default function buildConnection( props: ConnectionProps ) {
	// Promise with a lazy initialized `Connection`
	let connection: Promise< Connection > | null = null;

	// Async load the connection library and return a promise with its default export.
	// That's a factory function that creates and returns the `Connection` class instance.
	function importConnectionLib() {
		return import(
			/* webpackChunkName: "async-load-calypso-lib-happychat-connection" */ './connection'
		);
	}

	function getConnection(): Promise< Connection > {
		if ( ! connection ) {
			connection = importConnectionLib().then( ( { default: createConnection } ) =>
				createConnection( props )
			);
		}
		return connection;
	}

	// Forward a method call to the implementation. Works only for methods that return promises,
	// which, fortunately, is the case for all `Connection` methods.
	function forwardMethod( name: keyof Connection ) {
		return ( ...args: any[] ) => getConnection().then( ( conn ) => conn[ name ]( ...args ) );
	}

	return {
		init: forwardMethod( 'init' ),
		request: forwardMethod( 'request' ),
		send: forwardMethod( 'send' ),
	};
}
