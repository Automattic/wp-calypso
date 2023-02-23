import { UniversalNavbarHeader } from '@automattic/wpcom-template-parts';
import domReady from '@wordpress/dom-ready';
import { render } from '@wordpress/element';

domReady( () => {
	const isLoggedIn = document.body.classList.contains( 'logged-in' );
	const block = document.querySelector( '.happy-blocks-universal-header-block' );
	const attributes = JSON.parse( ( block as HTMLElement )?.dataset?.attributes ?? `{}` );

	return render( <UniversalNavbarHeader { ...attributes } isLoggedIn={ isLoggedIn } />, block );
} );
