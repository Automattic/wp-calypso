/**
 * External dependencies
 */
import '@automattic/calypso-polyfills';
import { setLocaleData } from '@wordpress/i18n';
import { I18nProvider } from '@automattic/react-i18n';
import { getLanguageSlugs } from '../../lib/i18n-utils';
import {
	getLanguageFile,
	getLanguageManifestFile,
	getTranslationChunkFile,
	switchWebpackCSS,
} from '../../lib/i18n-utils/switch-locale';
import { getUrlParts } from '../../lib/url/url-parts';
import React from 'react';
import ReactDom from 'react-dom';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import config from '../../config';
import { subscribe, select, dispatch } from '@wordpress/data';
import { initializeAnalytics } from '@automattic/calypso-analytics';

/**
 * Internal dependencies
 */
import GUTENBOARDING_BASE_NAME from './basename.json';
import { Gutenboard } from './gutenboard';
import { setupWpDataDebug } from './devtools';
import accessibleFocus from 'lib/accessible-focus';
import { path, Step } from './path';
import { SITE_STORE } from './stores/site';
import { USER_STORE } from './stores/user';
import { STORE_KEY as ONBOARD_STORE } from './stores/onboard';
import { addHotJarScript } from 'lib/analytics/hotjar';

/**
 * Style dependencies
 */
import 'assets/stylesheets/gutenboarding.scss';
import 'components/environment-badge/style.scss';

// TODO: remove when all needed core types are available
/*#__PURE__*/ import './gutenberg-types-patch';

function generateGetSuperProps() {
	return () => ( {
		environment: process.env.NODE_ENV,
		environment_id: config( 'env_id' ),
		site_id_label: 'wpcom',
		client: config( 'client_slug' ),
	} );
}

const DEFAULT_LOCALE_SLUG: string = config( 'i18n_default_locale_slug' );
const USE_TRANSLATION_CHUNKS: string =
	config.isEnabled( 'use-translation-chunks' ) ||
	getUrlParts( document.location.href ).searchParams.has( 'useTranslationChunks' );

type User = import('@automattic/data-stores').User.CurrentUser;
type Site = import('@automattic/data-stores').Site.SiteDetails;

interface AppWindow extends Window {
	currentUser?: User;
	i18nLocaleStrings?: string;
	installedChunks?: string[];
	__requireChunkCallback__?: {
		add( callback: Function ): void;
		getInstalledChunks(): string[];
	};
	BUILD_TARGET?: string;
}
declare const window: AppWindow;

/**
 * Handle redirects from development phase
 * TODO: Remove after a few months. See section definition as well.
 */
const DEVELOPMENT_BASENAME = '/gutenboarding';

window.AppBoot = async () => {
	if ( window.location.pathname.startsWith( DEVELOPMENT_BASENAME ) ) {
		const url = new URL( window.location.href );
		url.pathname = GUTENBOARDING_BASE_NAME + url.pathname.substring( DEVELOPMENT_BASENAME.length );
		window.location.replace( url.toString() );
		return;
	}

	setupWpDataDebug();
	// User is left undefined here because the user account will not be created
	// until after the user has completed the gutenboarding flow.
	// This also saves us from having to pull in lib/user/user and it's dependencies.
	initializeAnalytics( undefined, generateGetSuperProps() );
	addHotJarScript();
	// Add accessible-focus listener.
	accessibleFocus();

	let i18nLocaleData;
	try {
		const [ userLocale, { translatedChunks, ...localeData } ]: (
			| string
			| any
		 )[] = await getLocale();
		i18nLocaleData = localeData;
		setLocaleData( localeData );

		if ( USE_TRANSLATION_CHUNKS ) {
			await setupTranslationChunks( userLocale, translatedChunks );
		}

		// FIXME: Use rtl detection tooling
		if ( ( localeData as any )[ 'text direction\u0004ltr' ]?.[ 0 ] === 'rtl' ) {
			switchWebpackCSS( true );
		}
	} catch {}

	try {
		checkAndRedirectIfSiteWasCreatedRecently();
	} catch {}

	ReactDom.render(
		<I18nProvider localeData={ i18nLocaleData }>
			<BrowserRouter basename={ GUTENBOARDING_BASE_NAME }>
				<Switch>
					<Route exact path={ path }>
						<Gutenboard />
					</Route>
					<Route>
						<Redirect to="/" />
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
 * 1. If there's an explicit locale slug, use that locale.
 * 2. If i18nLocalStrings is present use those strings and data.
 * 3. If we have a currentUser object, use that locale to fetch data.
 * 4. Fetch the current user and use language to fetch data.
 * 5. TODO (#39312): If we have a URL locale slug, fetch and use data.
 * 6. Fallback to "en" locale without data.
 *
 * @returns Tuple of locale slug and locale data
 */
async function getLocale(): Promise< [ string, object ] > {
	// Explicit locale slug.
	const pathname = new URL( window.location.href ).pathname;
	const lastPathSegment = pathname.substr( pathname.lastIndexOf( '/' ) + 1 );
	if ( getLanguageSlugs().includes( lastPathSegment ) ) {
		const data = await getLocaleData( lastPathSegment );
		return [ lastPathSegment, data ];
	}

	// Bootstraped locale
	if ( window.i18nLocaleStrings ) {
		const bootstrappedLocaleData = JSON.parse( window.i18nLocaleStrings );
		return [ bootstrappedLocaleData[ '' ].localeSlug, bootstrappedLocaleData ];
	}

	// User without bootstrapped locale
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

	if ( USE_TRANSLATION_CHUNKS ) {
		const manifest = await getLanguageManifestFile( locale, window.BUILD_TARGET );
		const localeData = {
			...manifest.locale,
			translatedChunks: manifest.translatedChunks,
		};
		return localeData;
	}

	return getLanguageFile( locale );
}

function waitForCurrentUser(): Promise< User | undefined > {
	let unsubscribe: () => void = () => undefined;
	return new Promise< User | undefined >( ( resolve ) => {
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

async function checkAndRedirectIfSiteWasCreatedRecently() {
	const shouldPathCauseRedirectForSelectedSite = () => {
		return [ Step.CreateSite, Step.Plans, Step.Style ].some( ( step ) => {
			if ( window.location.pathname.startsWith( `/${ GUTENBOARDING_BASE_NAME }/${ step }` ) ) {
				return true;
			}
		} );
	};

	if ( shouldPathCauseRedirectForSelectedSite() ) {
		const selectedSiteDetails = await waitForSelectedSite();

		if ( selectedSiteDetails ) {
			const createdAtString = selectedSiteDetails?.options?.created_at;
			// "2020-05-11T01:08:15+00:00"

			if ( createdAtString ) {
				const createdAt = new Date( createdAtString );
				const diff = Date.now() - createdAt.getTime();
				const diffMinutes = diff / 1000 / 60;
				if ( diffMinutes < 10 && diffMinutes >= 0 ) {
					window.location.replace( `/home/${ selectedSiteDetails.ID }` );
					return;
				}
			}
		}
	}

	dispatch( ONBOARD_STORE ).setSelectedSite( undefined );
}

function waitForSelectedSite(): Promise< Site | undefined > {
	let unsubscribe: () => void = () => undefined;
	return new Promise< Site | undefined >( ( resolve ) => {
		const selectedSite = select( ONBOARD_STORE ).getSelectedSite();
		if ( ! selectedSite ) {
			return resolve( undefined );
		}
		unsubscribe = subscribe( () => {
			const resolvedSelectedSite = select( SITE_STORE ).getSite( selectedSite );
			if ( resolvedSelectedSite ) {
				resolve( resolvedSelectedSite );
			}

			if ( ! select( 'core/data' ).isResolving( SITE_STORE, 'getSite', [ selectedSite ] ) ) {
				resolve( undefined );
			}
		} );
		select( SITE_STORE ).getSite( selectedSite );
	} ).finally( unsubscribe );
}

function getLocaleFromUser( user: User ): string {
	return user.locale_variant || user.localeVariant || user.language || user.localeSlug;
}

async function setupTranslationChunks( localeSlug: string, translatedChunks: string[] = [] ) {
	if ( ! window.__requireChunkCallback__ ) {
		return;
	}

	interface TranslationChunksCache {
		[ propName: string ]: undefined | boolean;
	}
	const loadedTranslationChunks: TranslationChunksCache = {};
	const loadTranslationForChunkIfNeeded = async ( chunkId: string ) => {
		if ( ! translatedChunks.includes( chunkId ) || loadedTranslationChunks[ chunkId ] ) {
			return;
		}

		return getTranslationChunkFile( chunkId, localeSlug, window.BUILD_TARGET ).then(
			( translations ) => {
				setLocaleData( translations );
				loadedTranslationChunks[ chunkId ] = true;
			}
		);
	};

	const installedChunks = new Set(
		( window.installedChunks || [] ).concat( window.__requireChunkCallback__.getInstalledChunks() )
	);

	await Promise.all(
		[ ...installedChunks ].map( ( chunkId ) => loadTranslationForChunkIfNeeded( chunkId ) )
	);

	interface RequireChunkCallbackParameters {
		publicPath: string;
		scriptSrc: string;
	}

	window.__requireChunkCallback__.add(
		( { publicPath, scriptSrc }: RequireChunkCallbackParameters, promises: any[] ) => {
			const chunkId = scriptSrc.replace( publicPath, '' ).replace( /\.js$/, '' );

			promises.push( loadTranslationForChunkIfNeeded( chunkId ) );
		}
	);
}
