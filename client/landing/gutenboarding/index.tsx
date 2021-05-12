/**
 * External dependencies
 */
import '@automattic/calypso-polyfills';
import * as React from 'react';
import ReactDom from 'react-dom';
import { isEqual } from 'lodash';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import config from '@automattic/calypso-config';
import { subscribe, select, dispatch } from '@wordpress/data';
import { initializeAnalytics } from '@automattic/calypso-analytics';
import type { Site as SiteStore } from '@automattic/data-stores';
import accessibleFocus from '@automattic/accessible-focus';
import { getAvailableDesigns } from '@automattic/design-picker';
import type { Design } from '@automattic/design-picker';

/**
 * Internal dependencies
 */
import Gutenboard from './gutenboard';
import { LocaleContext } from './components/locale-context';
import { setupWpDataDebug } from './devtools';
import { Step, path } from './path';
import { SITE_STORE } from './stores/site';
import { STORE_KEY as ONBOARD_STORE } from './stores/onboard';
import { addHotJarScript } from 'calypso/lib/analytics/hotjar';
import { WindowLocaleEffectManager } from './components/window-locale-effect-manager';

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

window.AppBoot = async () => {
	setupWpDataDebug();
	// User is left undefined here because the user account will not be created
	// until after the user has completed the gutenboarding flow.
	// This also saves us from having to pull in lib/user/user and it's dependencies.
	initializeAnalytics( undefined, generateGetSuperProps() );
	addHotJarScript();
	// Add accessible-focus listener.
	accessibleFocus();

	// If site was recently created, redirect to customer site home.
	const shouldRedirect = await checkAndRedirectIfSiteWasCreatedRecently();
	if ( shouldRedirect ) {
		return;
	}

	// Update list of randomized designs in the gutenboarding session store
	ensureRandomizedDesignsAreUpToDate();

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
					return true;
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
			if (
				select( 'core/data' ).hasFinishedResolution( SITE_STORE, 'getSite', [ selectedSite ] )
			) {
				resolve( select( SITE_STORE ).getSite( selectedSite ) );
			}
		} );
		select( SITE_STORE ).getSite( selectedSite );
	} ).finally( unsubscribe );
}
/**
 * If the list of available designs (stored in the `@automattic/design-picker` package)
 * has been updated, replace the cached list of designs with the updated designs.
 */
function ensureRandomizedDesignsAreUpToDate() {
	const designsInStore = select( ONBOARD_STORE ).getRandomizedDesigns();
	const availableDesigns = getAvailableDesigns();
	if ( areCachedDesignsOutOfDate( designsInStore.featured, availableDesigns.featured ) ) {
		dispatch( ONBOARD_STORE ).setRandomizedDesigns( getAvailableDesigns( { randomize: true } ) );
	}
}

/**
 *
 * Compare cached designs in the ONBOARD_STORE to the source of designs defined
 * in the `@automattic/design-picker` package, in order to check if the two lists
 * contains exactly the same designs.
 *
 * @param stored randomizedDesigns cached in WP_ONBOARD
 * @param available designs sourced from the `@automattic/design-picker` package
 */
function areCachedDesignsOutOfDate( stored: Design[], available: Design[] ): boolean {
	const keyDesignsBySlug = (
		designsByKey: Record< string, Design >,
		currentDesign: Design
	): Record< string, Design > => ( {
		...designsByKey,
		[ currentDesign.slug ]: currentDesign,
	} );

	// Transform the lists of designs in a dictionary where the key is a design's slug
	const storedBySlug = stored.reduce( keyDesignsBySlug, {} );
	const availableBySlug = available.reduce( keyDesignsBySlug, {} );

	// If the two design maps are not deeply equal, it means that the
	// cached designs are out of date.
	return ! isEqual( storedBySlug, availableBySlug );
}
