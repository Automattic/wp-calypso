import domReady from '@wordpress/dom-ready';

let appPromise;
const loadApp = () => {
	if ( ! appPromise ) {
		appPromise = import( /* webpackChunkName: "command-palette-app" */ './mount' );
	}
	return appPromise;
};

// Lazy init on first Cmd/Ctrl+K
const onKeyDown = ( e ) => {
	if ( ( e.metaKey || e.ctrlKey ) && e.key.toLowerCase() === 'k' ) {
		e.preventDefault();
		document.removeEventListener( 'keydown', onKeyDown );
		loadApp().then( ( { mount } ) => mount( { openImmediately: true } ) );
	}
};

domReady( () => {
	document.addEventListener( 'keydown', onKeyDown );
} );
