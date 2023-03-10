import { PureUniversalNavbarFooter, LanguageOptions } from '@automattic/wpcom-template-parts';
import domReady from '@wordpress/dom-ready';
import { hydrate } from 'react-dom';

domReady( () => {
	const availableLanguages = Array.from(
		document.querySelectorAll( 'link[hrefLang]:not( [hrefLang=x-default] )' )
	) as HTMLLinkElement[];

	const languageOptions = availableLanguages.reduce( ( acc, language ) => {
		acc[ language.getAttribute( 'hreflang' ) as string ] = language.href as string;
		return acc;
	}, {} as LanguageOptions );

	function onLanguageChange( event: React.ChangeEvent< HTMLSelectElement > ) {
		const selectedLanguage: string = event.target.value;

		window.location.href = languageOptions[ selectedLanguage ];
	}

	document.querySelectorAll( `.wp-block-happy-blocks-universal-footer` ).forEach( ( el ) => {
		const locale = el.getAttribute( 'data-locale' ) as string;
		hydrate(
			<PureUniversalNavbarFooter
				onLanguageChange={ onLanguageChange }
				languageOptions={ languageOptions }
				locale={ locale }
			/>,
			el
		);
	} );
} );
