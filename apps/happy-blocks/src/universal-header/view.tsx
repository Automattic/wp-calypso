import domReady from '@wordpress/dom-ready';
import { render, createElement } from '@wordpress/element';

domReady( () => {
	return render(
		createElement( 'h1', { className: 'greeting' }, 'Hello' ),
		document.querySelector( '.happy-blocks-universal-header-block' )
	);
} );
