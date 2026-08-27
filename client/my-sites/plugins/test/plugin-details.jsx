/** @jest-environment jsdom */

jest.mock( '@automattic/calypso-router' );

let mockWpComPlugin = { data: undefined, isFetched: false, isFetching: true };
jest.mock( 'calypso/data/marketplace/use-wpcom-plugins-query', () => ( {
	useWPCOMPlugin: () => mockWpComPlugin,
} ) );

jest.mock( 'calypso/data/marketplace/use-es-query', () => ( {
	useESPlugin: () => ( { data: {} } ),
} ) );

jest.mock( 'calypso/data/marketplace/use-marketplace-reviews', () => ( {
	useMarketplaceReviewsQuery: () => ( { data: [] } ),
	useInfiniteMarketplaceReviewsQuery: () => ( { data: { pages: [] }, fetchNextPage: () => {} } ),
	useMarketplaceReviewsStatsQuery: () => ( { data: undefined } ),
	useCreateMarketplaceReviewMutation: () => ( { mutate: () => {} } ),
	useUpdateMarketplaceReviewMutation: () => ( { mutate: () => {} } ),
	useDeleteMarketplaceReviewMutation: () => ( { mutate: () => {} } ),
	useIsUserAllowedToReview: () => ( { data: false } ),
} ) );

jest.mock( 'calypso/my-sites/plugins/use-plugin-is-maintained', () => ( {
	usePluginIsMaintained: () => true,
} ) );

jest.mock( 'calypso/my-sites/plugins/hooks/use-is-marketplace-redesign-enabled', () => ( {
	useIsMarketplaceRedesignEnabled: () => false,
} ) );

// The tests drive the installed-plugins fetch lifecycle through the store, so
// the query component must not start a real request.
jest.mock( 'calypso/components/data/query-plugins', () => () => null );

// `localizePath` prefixes the locale for logged-out visitors on a magnificent
// locale. The stub makes that prefix visible without loading translations.
let mockLocalePrefix = '';
jest.mock( 'calypso/my-sites/plugins/utils', () => ( {
	...jest.requireActual( 'calypso/my-sites/plugins/utils' ),
	useLocalizedPlugins: () => ( {
		localizePath: ( path ) => `${ mockLocalePrefix }${ path }`,
	} ),
} ) );

import page from '@automattic/calypso-router';
import { merge } from '@automattic/js-utils';
import { act } from '@testing-library/react';
import { applyMiddleware, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import {
	PLUGINS_RECEIVE,
	PLUGINS_REQUEST,
	PLUGINS_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import breadcrumb from 'calypso/state/breadcrumb/reducer';
import documentHead from 'calypso/state/document-head/reducer';
import plugins from 'calypso/state/plugins/reducer';
import preferences from 'calypso/state/preferences/reducer';
import productsList from 'calypso/state/products-list/reducer';
import purchases from 'calypso/state/purchases/reducer';
import initialReducer from 'calypso/state/reducer';
import siteConnection from 'calypso/state/site-connection/reducer';
import { reducer as ui } from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import PluginDetails from '../plugin-details';

// Start Booking: the marketplace product slug differs from the slug the plugin
// is installed under, which is what the installed-plugins state uses.
const PLUGIN_SLUG = 'calendar-booking-wpcom';
const SOFTWARE_SLUG = 'calendar-booking';
const SITE_ID = 1;
const SITE_SLUG = 'example.wordpress.com';

// The component renders `NoPermissionsError` and stops when the current user
// cannot manage plugins. That early return sits below the redirect effect, so
// this state exercises the effect without building the whole detail page.
const initialReduxState = {
	ui: { selectedSiteId: SITE_ID },
	sites: {
		items: { [ SITE_ID ]: { ID: SITE_ID, title: 'Test Site', URL: `https://${ SITE_SLUG }` } },
		requestingAll: false,
	},
	currentUser: { id: 12, capabilities: { [ SITE_ID ]: { manage_options: false } } },
	siteConnection: { items: { [ SITE_ID ]: true } },
	purchases: {
		data: [],
		hasLoadedUserPurchasesFromServer: false,
		hasLoadedSitePurchasesFromServer: false,
	},
	productsList: {
		items: {
			[ PLUGIN_SLUG ]: {
				product_type: 'marketplace_plugin',
				billing_product_slug: PLUGIN_SLUG,
			},
		},
	},
	plugins: { installed: { isRequesting: {}, plugins: {}, status: {} } },
	preferences: { remoteValues: {}, localValues: {} },
	breadcrumb: [],
};

// A Jetpack site the user can manage passes `getSelectedOrAllSitesWithPlugins`,
// so the page must wait for that site's installed plugins before it redirects.
const jetpackSiteState = {
	sites: {
		items: {
			[ SITE_ID ]: {
				ID: SITE_ID,
				title: 'Test Site',
				URL: `https://${ SITE_SLUG }`,
				jetpack: true,
				visible: true,
			},
		},
	},
	currentUser: { capabilities: { [ SITE_ID ]: { manage_options: true } } },
};

const retiredProduct = {
	data: { slug: PLUGIN_SLUG, org_slug: SOFTWARE_SLUG, is_retired: true },
	isFetched: true,
	isFetching: false,
};

const reducers = {
	ui,
	plugins,
	preferences,
	productsList,
	breadcrumb,
	siteConnection,
	purchases,
	documentHead,
};

// Build the store here so that a test can dispatch into it after the render.
const createTestStore = ( stateOverrides ) => {
	const reducer = Object.entries( reducers ).reduce(
		( combined, [ key, keyReducer ] ) => combined.addReducer( [ key ], keyReducer ),
		initialReducer
	);
	return createStore(
		reducer,
		merge( {}, initialReduxState, stateOverrides ),
		applyMiddleware( thunk )
	);
};

const render = ( stateOverrides = {} ) => {
	const store = createTestStore( stateOverrides );
	renderWithProvider( <PluginDetails pluginSlug={ PLUGIN_SLUG } />, { store } );
	return { store };
};

const receiveInstalledPlugins = ( store, installedPlugins ) => {
	act( () => {
		store.dispatch( { type: PLUGINS_REQUEST, siteId: SITE_ID } );
	} );
	act( () => {
		store.dispatch( { type: PLUGINS_RECEIVE, siteId: SITE_ID, data: installedPlugins } );
		store.dispatch( { type: PLUGINS_REQUEST_SUCCESS, siteId: SITE_ID } );
	} );
};

describe( 'PluginDetails retired product redirect', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockLocalePrefix = '';
		window.__i18n_text_domain__ = JSON.stringify( 'default' );
	} );

	test( 'redirects to the plugin browser for the selected site once a retired product has been fetched', () => {
		mockWpComPlugin = retiredProduct;

		render();

		expect( page.redirect ).toHaveBeenCalledWith( `/plugins/${ SITE_SLUG }` );
	} );

	test( 'redirects to /plugins when no site is selected', () => {
		mockWpComPlugin = retiredProduct;

		render( { ui: { selectedSiteId: null } } );

		expect( page.redirect ).toHaveBeenCalledWith( '/plugins' );
	} );

	test( 'keeps the locale prefix for a logged-out visitor', () => {
		mockWpComPlugin = retiredProduct;
		mockLocalePrefix = '/de';

		render( { ui: { selectedSiteId: null }, currentUser: { id: null, capabilities: {} } } );

		expect( page.redirect ).toHaveBeenCalledWith( '/de/plugins' );
	} );

	test( 'does not redirect when the product is not retired', () => {
		mockWpComPlugin = {
			data: { slug: PLUGIN_SLUG, is_retired: false },
			isFetched: true,
			isFetching: false,
		};

		render();

		expect( page.redirect ).not.toHaveBeenCalled();
	} );

	test( 'does not redirect when the API omits is_retired', () => {
		mockWpComPlugin = { data: { slug: PLUGIN_SLUG }, isFetched: true, isFetching: false };

		render();

		expect( page.redirect ).not.toHaveBeenCalled();
	} );

	test( 'does not redirect on partial data, before the fetch resolves', () => {
		// A stale or in-flight response must never trigger the redirect.
		mockWpComPlugin = {
			data: { slug: PLUGIN_SLUG, is_retired: true },
			isFetched: false,
			isFetching: true,
		};

		render();

		expect( page.redirect ).not.toHaveBeenCalled();
	} );

	test( 'waits for the installed-plugins fetch on a site that can have plugins', () => {
		mockWpComPlugin = retiredProduct;

		const { store } = render( jetpackSiteState );

		expect( page.redirect ).not.toHaveBeenCalled();

		receiveInstalledPlugins( store, [] );

		expect( page.redirect ).toHaveBeenCalledWith( `/plugins/${ SITE_SLUG }` );
	} );

	test( 'keeps the page when the retired plugin is installed on the selected site', () => {
		mockWpComPlugin = retiredProduct;

		const { store } = render( jetpackSiteState );

		receiveInstalledPlugins( store, [
			{ slug: SOFTWARE_SLUG, id: `${ SOFTWARE_SLUG }/${ SOFTWARE_SLUG }.php`, active: true },
		] );

		expect( page.redirect ).not.toHaveBeenCalled();
	} );
} );
