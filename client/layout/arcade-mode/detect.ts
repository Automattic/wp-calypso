// Konami code detector. Kept tiny so it can sit in the main Calypso bundle:
// the heavy activation work (DOM mutation, font load, escape listener, lives
// counter) only loads after the sequence matches.
const KONAMI = 'arrowup,arrowup,arrowdown,arrowdown,arrowleft,arrowright,arrowleft,arrowright,b,a,';

export function installKonamiListener(): () => void {
	let buffer = '';
	const onKeyDown = ( event: KeyboardEvent ) => {
		if ( event.metaKey || event.ctrlKey || event.altKey || event.repeat ) {
			return;
		}
		const target = event.target;
		if (
			target instanceof HTMLElement &&
			( target.tagName === 'INPUT' ||
				target.tagName === 'TEXTAREA' ||
				target.tagName === 'SELECT' ||
				target.isContentEditable )
		) {
			return;
		}
		buffer = ( buffer + event.key.toLowerCase() + ',' ).slice( -KONAMI.length );
		if ( buffer === KONAMI ) {
			buffer = '';
			import( /* webpackChunkName: "async-load-calypso-layout-arcade-mode" */ './activate' ).then(
				( m ) => m.activateArcadeMode()
			);
		}
	};
	document.addEventListener( 'keydown', onKeyDown );
	return () => document.removeEventListener( 'keydown', onKeyDown );
}
