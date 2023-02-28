import { LocaleProvider } from '@automattic/i18n-utils';
import { UniversalNavbarHeader } from '@automattic/wpcom-template-parts';
import domReady from '@wordpress/dom-ready';
import { render } from '@wordpress/element';

domReady( () => {
	const isLoggedIn = document.body.classList.contains( 'logged-in' );
	const block = document.querySelector( '.happy-blocks-universal-header-block' );
	const attributes = JSON.parse( ( block as HTMLElement )?.dataset?.attributes ?? `{}` );

	render(
		<LocaleProvider localeSlug={ attributes.locale }>
			<UniversalNavbarHeader { ...attributes } isLoggedIn={ isLoggedIn } />
		</LocaleProvider>,
		block
	);
} );
