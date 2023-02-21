import { UniversalNavbarHeader } from '@automattic/wpcom-template-parts';
import domReady from '@wordpress/dom-ready';
import { render } from '@wordpress/element';

domReady( () => {
	return render(
		<UniversalNavbarHeader isLoggedIn />,
		document.querySelector( '.happy-blocks-universal-header-block' )
	);
} );
