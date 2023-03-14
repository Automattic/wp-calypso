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
import { localizeUrl } from '@automattic/i18n-utils';
import { PureUniversalNavbarFooter, LanguageOptions } from '@automattic/wpcom-template-parts';
import domReady from '@wordpress/dom-ready';
import { render } from 'react-dom';

domReady( () => {
	const props: {
		languageOptions?: LanguageOptions;
	} = {};

	const availableLanguages = Array.from(
		document.querySelectorAll( 'link[hrefLang]:not( [hrefLang=x-default] )' )
	) as HTMLLinkElement[];

	const languageOptions = availableLanguages.reduce( ( acc, language ) => {
		acc[ language.getAttribute( 'hreflang' ) as string ] = language.href as string;
		return acc;
	}, {} as LanguageOptions );

	function onLanguageChange( event: React.ChangeEvent< HTMLSelectElement > ) {
		const selectedLanguage: string = event.target.value;
		// if there's an alternate URL for the selected language, use that, else go home with the selected language
		if ( languageOptions[ selectedLanguage ] ) {
			window.location.href = languageOptions[ selectedLanguage ];
		} else {
			const localizedHomePage = localizeUrl( 'https://en.support.wordpress.com', selectedLanguage );
			window.location.href = localizedHomePage;
		}
	}

	if ( availableLanguages.length > 1 ) {
		props.languageOptions = languageOptions;
	}

	document.querySelectorAll( `.wp-block-happy-blocks-universal-footer` ).forEach( ( el ) => {
		const locale = el.getAttribute( 'data-locale' ) as string;
		render(
			<PureUniversalNavbarFooter
				onLanguageChange={ onLanguageChange }
				locale={ locale }
				{ ...props }
			/>,
			el
		);
	} );
} );

export default async () => renderToStaticMarkup( <View /> );
