export function getInitialState( reducer ) {
	return reducer( undefined, { type: '@@calypso/INIT' } );
}
