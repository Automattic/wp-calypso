/**
 * External dependencies
 */
import '@automattic/calypso-polyfills';
import * as React from 'react';
import ReactDom from 'react-dom';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import config from '../../config';
import { subscribe, select, dispatch } from '@wordpress/data';
import { initializeAnalytics } from '@automattic/calypso-analytics';
import type { Site as SiteStore } from '@automattic/data-stores';
import { xorWith, isEqual, isEmpty, shuffle } from 'lodash';
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import Gutenboard from './gutenboard';
import { LocaleContext } from './components/locale-context';
import { setupWpDataDebug } from './devtools';
import accessibleFocus from 'calypso/lib/accessible-focus';
import availableDesigns from './available-designs';
import { Step, path } from './path';
import { SITE_STORE } from './stores/site';
import { STORE_KEY as ONBOARD_STORE } from './stores/onboard';
import { addHotJarScript } from 'calypso/lib/analytics/hotjar';
import { WindowLocaleEffectManager } from './components/window-locale-effect-manager';
import type { Design } from './stores/onboard/types';

/**
 * Style dependencies
 */
import 'calypso/assets/stylesheets/gutenboarding.scss';
import 'calypso/components/environment-badge/style.scss';

function generateGetSuperProps() {
	return () => ( {
		environment: process.env.NODE_ENV,
		environment_id: config( 'env_id' ),
		site_id_label: 'wpcom',
		client: config( 'client_slug' ),
	} );
}

type Site = SiteStore.SiteDetails;

interface AppWindow extends Window {
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
		url.pathname = 'new' + url.pathname.substring( DEVELOPMENT_BASENAME.length );
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

	try {
		checkAndRedirectIfSiteWasCreatedRecently();
	} catch {}

	// Update list of randomized designs in the gutenboarding session store
	ensureRandomizedDesignsAreUpToDate();

	// Get podcast title if this will be an Anchor.fm podcast site
	try {
		setPodcastTitle();
	} catch {}

	ReactDom.render(
		<LocaleContext>
			<WindowLocaleEffectManager />
			<BrowserRouter basename="new">
				<Switch>
					<Route exact path={ path }>
						<Gutenboard />
					</Route>
					<Route>
						<Redirect to="/" />
					</Route>
				</Switch>
			</BrowserRouter>
		</LocaleContext>,
		document.getElementById( 'wpcom' )
	);
};

async function checkAndRedirectIfSiteWasCreatedRecently() {
	const shouldPathCauseRedirectForSelectedSite = () => {
		return [ Step.CreateSite, Step.Plans, Step.Style ].some( ( step ) => {
			if ( window.location.pathname.startsWith( `/new/${ step }` ) ) {
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
/**
 * If available-designs-config.json has been updated, replace the cached list
 * of designs with the updated designs
 */
function ensureRandomizedDesignsAreUpToDate() {
	const designsInStore = select( ONBOARD_STORE ).getRandomizedDesigns();
	if ( ! isDeepEqual( designsInStore.featured, availableDesigns.featured ) ) {
		dispatch( ONBOARD_STORE ).setRandomizedDesigns( {
			...availableDesigns,
			featured: shuffle( availableDesigns.featured ),
		} );
	}
}

/**
 *
 * Compare cached designs in the ONBOARD_STORE to the source of designs in
 * available-designs-config.json
 *
 * @param stored randomizedDesigns cached in WP_ONBOARD
 * @param available designs sourced from available-designs-config.json
 */
function isDeepEqual( stored: Design[], available: Design[] ): boolean {
	return isEmpty( xorWith( stored, available, isEqual ) );
}

/**
 * Pre-fill Anchor.fm podcast title if available
 */
async function setPodcastTitle() {
	// Feature flag 'anchor-fm-dev' is required for anchor podcast id to be read
	if ( ! config.isEnabled( 'anchor-fm-dev' ) ) {
		return;
	}

	const anchorFmPodcastId = new URLSearchParams( window.location.search )
		.get( 'anchor_podcast' )
		?.replace( /[^a-zA-Z0-9]/g, '' );

	if ( ! anchorFmPodcastId ) {
		return;
	}

	await apiFetch( {
		path: `https://public-api.wordpress.com/wpcom/v2/podcast-details?url=https://anchor.fm/s/${ encodeURIComponent(
			anchorFmPodcastId
		) }/podcast/rss`,
	} ).then( ( response ) => {
		response.title?.length > 1 && dispatch( ONBOARD_STORE ).setSiteTitle( response.title );
	} );
}
