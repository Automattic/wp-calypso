export function isForkedProcess() {
	return process.env.CALYPSO_IS_FORK;
}

export function sendBootSignal() {
	process.send( { boot: 'ready' } );
}
