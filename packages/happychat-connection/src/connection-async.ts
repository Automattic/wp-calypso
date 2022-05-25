import type { Connection, Dispatch } from './connection';
import type { Action, ConnectionProps, HappychatAuth } from './types';

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

	return {
		async init( dispatch: Dispatch, auth: Promise< HappychatAuth > ) {
			const conn = await getConnection();
			return conn.init( dispatch, auth );
		},
		async request( action: Action, timeout: number ) {
			const conn = await getConnection();
			return conn.request( action, timeout );
		},
		async send( action: Action ) {
			const conn = await getConnection();
			return conn.send( action );
		},
	};
}
