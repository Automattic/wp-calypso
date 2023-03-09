import { UniversalNavbarHeader } from '@automattic/wpcom-template-parts';
import domReady from '@wordpress/dom-ready';
import { render } from '@wordpress/element';
import { renderToStaticMarkup } from 'react-dom/server';

function View() {
	return <UniversalNavbarHeader isLoggedIn />;
}

domReady( () => {
	const block = document.querySelector( '.happy-blocks-universal-header-block' );

	if ( block ) {
		render( <View />, block );
	}
} );

export default async () => renderToStaticMarkup( <View /> );
