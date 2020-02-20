/**
 * External dependencies
 */
import '@automattic/calypso-polyfills';
import { setLocaleData } from '@wordpress/i18n';
import { I18nProvider } from '@automattic/react-i18n';
import { getLanguageFile } from '../../lib/i18n-utils/switch-locale';
import React from 'react';
import ReactDom from 'react-dom';
import { BrowserRouter, Route, Switch, Redirect, generatePath } from 'react-router-dom';
import config from '../../config';
import { subscribe, select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { Gutenboard } from './gutenboard';
import { setupWpDataDebug } from './devtools';
import accessibleFocus from 'lib/accessible-focus';
import { path, Step } from './path';
import { USER_STORE } from './stores/user';

/**
 * Style dependencies
 */
import 'assets/stylesheets/gutenboarding.scss';
import 'components/environment-badge/style.scss';

const DEFAULT_LOCALE_SLUG: string = config( 'i18n_default_locale_slug' );

type User = import('@automattic/data-stores').User.CurrentUser;

interface AppWindow extends Window {
	currentUser?: User;
	i18nLocaleStrings?: string;
}
declare const window: AppWindow;

window.AppBoot = async () => {
	if ( ! config.isEnabled( 'gutenboarding' ) ) {
		window.location.href = '/';
		return;
	}
	setupWpDataDebug();

	// Add accessible-focus listener.
	accessibleFocus();

	let locale = DEFAULT_LOCALE_SLUG;
	try {
		const [ userLocale, localeData ] = await getLocale();
		setLocaleData( localeData );
		locale = userLocale;
	} catch {}

	ReactDom.render(
		<I18nProvider locale={ locale }>
			<BrowserRouter basename="gutenboarding">
				<Switch>
					<Route exact path={ path }>
						<Gutenboard />
					</Route>
					<Route>
						<Redirect to={ generatePath( path, { step: Step.IntentGathering } ) } />
					</Route>
				</Switch>
			</BrowserRouter>
		</I18nProvider>,
		document.getElementById( 'wpcom' )
	);
};

/**
 * Load the user's locale
 *
 * 1. If i18nLocalStrings is present use those strings and data.
 * 2. If we have a currentUser object, use that locale to fetch data.
 * 3. Fetch the current user and use language to fetch data.
 * 4. TODO (#39312): If we have a URL locale slug, fetch and use data.
 * 5. Fallback to "en" locale without data.
 *
 * @returns Tuple of locale slug and locale data
 */
async function getLocale(): Promise< [ string, object ] > {
	if ( window.i18nLocaleStrings ) {
		const bootstrappedLocaleData = JSON.parse( window.i18nLocaleStrings );
		return [ bootstrappedLocaleData[ '' ].localeSlug, bootstrappedLocaleData ];
	}
	const user = window.currentUser || ( await waitForCurrentUser() );
	if ( ! user ) {
		return [ DEFAULT_LOCALE_SLUG, {} ];
	}
	const localeSlug: string = getLocaleFromUser( user );

	const data = await getLocaleData( localeSlug );
	return [ localeSlug, data ];
}

async function getLocaleData( locale: string ) {
	if ( locale === DEFAULT_LOCALE_SLUG ) {
		return {};
	}
	return getLanguageFile( locale );
}

function waitForCurrentUser(): Promise< User | undefined > {
	let unsubscribe: () => void = () => undefined;
	return new Promise< User | undefined >( resolve => {
		unsubscribe = subscribe( () => {
			const currentUser = select( USER_STORE ).getCurrentUser();
			if ( currentUser ) {
				resolve( currentUser );
			}
			if ( ! select( 'core/data' ).isResolving( USER_STORE, 'getCurrentUser' ) ) {
				resolve( undefined );
			}
		} );
		select( USER_STORE ).getCurrentUser();
	} ).finally( unsubscribe );
}

function getLocaleFromUser( user: User ): string {
	return user.locale_variant || user.language;
}
