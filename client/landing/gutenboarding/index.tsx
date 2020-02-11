/**
 * External dependencies
 */
import '@automattic/calypso-polyfills';
import { setLocaleData } from '@wordpress/i18n';
import { I18nContext } from '@automattic/react-i18n';
import React, { useState, FunctionComponent } from 'react';
import ReactDom from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import config from '../../config';

/**
 * Internal dependencies
 */
import { Gutenboard } from './gutenboard';
import { setupWpDataDebug } from './devtools';
import accessibleFocus from 'lib/accessible-focus';
/**
 * Style dependencies
 */
import 'assets/stylesheets/gutenboarding.scss';
import 'components/environment-badge/style.scss';

window.AppBoot = () => {
	if ( ! config.isEnabled( 'gutenboarding' ) ) {
		window.location.href = '/';
	} else {
		setupWpDataDebug();

		// Add accessible-focus listener.
		accessibleFocus();

		ReactDom.render(
			<CalypsoI18n>
				<BrowserRouter basename="gutenboarding">
					<Gutenboard />
				</BrowserRouter>
			</CalypsoI18n>,
			document.getElementById( 'wpcom' )
		);
	}
};

const CalypsoI18n: FunctionComponent = ( { children } ) => {
	const [ locale, setLocale ] = useState< string >( 'en' );

	// TODO: Hack for demonstration
	( window as any ).changeLocale = ( localeSlug: string ) => {
		changeLocale( localeSlug ).then( setLocale );
	};
	return <I18nContext.Provider value={ locale }>{ children }</I18nContext.Provider>;
};

function getLanguageFilePathUrl() {
	const protocol = typeof window === 'undefined' ? 'https://' : '//'; // use a protocol-relative path in the browser

	return `${ protocol }widgets.wp.com/languages/calypso/`;
}

function getLanguageFileUrl( localeSlug: string, fileType = 'json', languageRevisions = {} ) {
	if ( ! [ 'js', 'json' ].includes( fileType ) ) {
		fileType = 'json';
	}

	const revision = languageRevisions[ localeSlug ];
	const fileUrl = `${ getLanguageFilePathUrl() }${ localeSlug }-v1.1.${ fileType }`;

	return typeof revision === 'number' ? fileUrl + `?v=${ revision }` : fileUrl;
}

async function getLanguageFile( targetLocaleSlug: string ) {
	const url = getLanguageFileUrl( targetLocaleSlug, 'json', window.languageRevisions || {} );

	const response = await globalThis.fetch( url );
	if ( response.ok ) {
		if ( response.bodyUsed ) {
			// If the body was already used, we assume that we already parsed the
			// response and set the locale in the DOM, so we don't need to do anything
			// else here.
			return;
		}
		return await response.json();
	}

	// Invalid response.
	throw new Error();
}

async function changeLocale( localeSlug: string ) {
	const localeData = await getLanguageFile( localeSlug );
	setLocaleData( localeData );
	return localeSlug;
}
