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
} ) );

jest.mock( 'calypso/my-sites/plugins/use-plugin-is-maintained', () => ( {
	usePluginIsMaintained: () => true,
} ) );

jest.mock( 'calypso/my-sites/plugins/hooks/use-is-marketplace-redesign-enabled', () => ( {
	useIsMarketplaceRedesignEnabled: () => false,
} ) );

import page from '@automattic/calypso-router';
import { merge } from '@automattic/js-utils';
import breadcrumb from 'calypso/state/breadcrumb/reducer';
import documentHead from 'calypso/state/document-head/reducer';
import plugins from 'calypso/state/plugins/reducer';
import productsList from 'calypso/state/products-list/reducer';
import purchases from 'calypso/state/purchases/reducer';
import siteConnection from 'calypso/state/site-connection/reducer';
import { reducer as ui } from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import PluginDetails from '../plugin-details';

const PLUGIN_SLUG = 'sensei-pro';

// The component renders `NoPermissionsError` and stops when the current user
// cannot manage plugins. That early return sits below the redirect effect, so
// this state exercises the effect without building the whole detail page.
const initialReduxState = {
	ui: { selectedSiteId: 1 },
	sites: {
		items: { 1: { ID: 1, title: 'Test Site', slug: 'example.wordpress.com' } },
		requestingAll: false,
	},
	currentUser: { id: 12, capabilities: { 1: { manage_options: false } } },
	siteConnection: { items: { 1: true } },
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
	breadcrumb: [],
};

const render = () =>
	renderWithProvider( <PluginDetails pluginSlug={ PLUGIN_SLUG } />, {
		initialState: merge( {}, initialReduxState ),
		reducers: { ui, plugins, productsList, breadcrumb, siteConnection, purchases, documentHead },
	} );

describe( 'PluginDetails retired product redirect', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		window.__i18n_text_domain__ = JSON.stringify( 'default' );
	} );

	test( 'redirects to /plugins once a retired product has been fetched', () => {
		mockWpComPlugin = {
			data: { slug: PLUGIN_SLUG, is_retired: true },
			isFetched: true,
			isFetching: false,
		};

		render();

		expect( page.redirect ).toHaveBeenCalledWith( '/plugins' );
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
} );
