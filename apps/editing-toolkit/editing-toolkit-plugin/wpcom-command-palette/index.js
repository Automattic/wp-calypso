import domReady from '@wordpress/dom-ready';
import CommandPalette from 'calypso/components/command-palette';
console.log( 'hi' );

domReady( () => {
	const mountPoint = document.createElement( 'div' );
	mountPoint.id = 'wp-commands';
	document.body.appendChild( mountPoint );
	const root = wp.element.createRoot( mountPoint );
	root.render( wp.element.createElement( CommandPalette, null ) );
} );
