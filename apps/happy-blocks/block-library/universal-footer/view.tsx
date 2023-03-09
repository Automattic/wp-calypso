import { UniversalNavbarFooter } from '@automattic/wpcom-template-parts';
import domReady from '@wordpress/dom-ready';
import { render } from '@wordpress/element';
import { renderToStaticMarkup } from 'react-dom/server';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

function View() {
	return <UniversalNavbarFooter onLanguageChange={ noop } isLoggedIn currentRoute="/" />;
}

domReady( () => {
	const block = document.querySelector( '.happy-blocks-universal-footer-block' );

	if ( block ) {
		render( <View />, block );
	}
} );

export default async () => renderToStaticMarkup( <View /> );
