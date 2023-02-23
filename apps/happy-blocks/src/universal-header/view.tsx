import { UniversalNavbarHeader } from '@automattic/wpcom-template-parts';
import { render } from '@wordpress/element';

( () => {
	const isLoggedIn = document.body.classList.contains( 'logged-in' );
	const block = document.querySelector( '.happy-blocks-universal-header-block' );
	const attributes = JSON.parse( ( block as HTMLElement )?.dataset?.attributes ?? `{}` );

	render( <UniversalNavbarHeader { ...attributes } isLoggedIn={ isLoggedIn } />, block );
} )();
