const debug = require( 'debug' )( 'calypso:desktop:process' );

let pingKillswitch = null;

export function isForkedProcess() {
	return process.env.CALYPSO_IS_FORK;
}

export function ready() {
	sendBootSignal();

	process.on( 'message', ( message ) => {
		debug( 'on.message: ' + message );

		if ( message.ping ) {
			sendPingSignal( message.ping );
		}
	} );
}

function sendBootSignal() {
	process.send( { boot: 'ready' } );
}

function sendPingSignal( pingTimeout ) {
	debug( 'Got ping from Electron. Clearing killswitch.' );
	clearTimeout( pingKillswitch );

	setTimeout( () => {
		debug( 'Sending ping to Electron. Restarting killswitch.' );
		process.send( { ping: pingTimeout } );
		pingKillswitch = setTimeout( maybeKillswitch, ( pingTimeout * 3 ) );
	}, pingTimeout );
}

function maybeKillswitch() {
	debug( 'Failed to get ping from Electron; exiting.' );
	process.exit();
}
