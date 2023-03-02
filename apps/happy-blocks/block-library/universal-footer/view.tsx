import { LocaleProvider } from '@automattic/i18n-utils';
import { UniversalNavbarFooter } from '@automattic/wpcom-template-parts';
import domReady from '@wordpress/dom-ready';
import { render } from '@wordpress/element';
import useI18nCalypsoTranslations from '../shared/use-i18n-calypso-translations';

function View( { isLoggedIn = false, attributes = {} as any } ) {
	useI18nCalypsoTranslations();
	return (
		<LocaleProvider localeSlug={ attributes.locale }>
			<UniversalNavbarFooter
				currentRoute={ window.location.pathname }
				onLanguageChange={ ( event ) => window.location.assign( event.target.value ) }
				isLoggedIn={ isLoggedIn }
			/>
		</LocaleProvider>
	);
}

domReady( () => {
	const isLoggedIn = document.body.classList.contains( 'logged-in' );
	const block = document.querySelector( '.happy-blocks-universal-footer-block' );
	const attributes = JSON.parse( ( block as HTMLElement )?.dataset?.attributes ?? `{}` );

	render( <View isLoggedIn={ isLoggedIn } attributes={ attributes } />, block );
} );
