/** @jest-environment jsdom */

jest.mock( 'page' );
jest.mock( 'calypso/lib/wporg', () => ( {
	getWporgLocaleCode: () => 'it_US',
	fetchPluginsList: () => Promise.resolve( [] ),
} ) );
jest.mock( 'calypso/lib/url-search', () => ( Component ) => ( props ) => (
	<Component { ...props } doSearch={ jest.fn() } />
) );
jest.mock( 'calypso/blocks/upsell-nudge', () => ( { plan } ) => (
	<div data-testid="upsell-nudge">{ plan }</div>
) );

let mockPlugins = [];
jest.mock( 'calypso/data/marketplace/use-wporg-plugin-query', () => ( {
	useWPORGPlugins: jest.fn( () => ( { data: { plugins: mockPlugins } } ) ),
	useWPORGInfinitePlugins: jest.fn( () => ( {
		data: { plugins: mockPlugins },
		fetchNextPage: jest.fn(),
	} ) ),
} ) );

jest.mock( 'calypso/data/marketplace/use-wpcom-plugins-query', () => ( {
	useWPCOMPluginsList: () => ( { data: [] } ),
	useWPCOMFeaturedPlugins: () => ( { data: [] } ),
} ) );

jest.mock( 'calypso/data/marketplace/use-es-query', () => ( {
	useSiteSearchPlugins: jest.fn( () => ( {
		data: { plugins: mockPlugins },
		fetchNextPage: jest.fn(),
	} ) ),
	useESPluginsInfinite: jest.fn( () => ( {
		data: { plugins: mockPlugins },
		fetchNextPage: jest.fn(),
	} ) ),
} ) );

jest.mock( '@automattic/languages', () => [
	{
		value: 1,
		langSlug: 'it',
		name: 'Italian English',
		wpLocale: 'it_US',
		popular: 1,
		territories: [ '019' ],
	},
] );

jest.mock( 'calypso/state/purchases/selectors', () => ( {
	getUserPurchases: jest.fn(),
	isFetchingSitePurchases: jest.fn( () => false ),
} ) );

jest.mock( 'calypso/my-sites/plugins/use-preinstalled-premium-plugin', () =>
	jest.fn( () => ( { usePreinstalledPremiumPlugin: jest.fn() } ) )
);

import {
	FEATURE_INSTALL_PLUGINS,
	PLAN_FREE,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_BLOGGER,
	PLAN_BLOGGER_2_YEARS,
} from '@automattic/calypso-products';
import { screen } from '@testing-library/react';
import { merge } from 'lodash';
import documentHead from 'calypso/state/document-head/reducer';
import plugins from 'calypso/state/plugins/reducer';
import productsList from 'calypso/state/products-list/reducer';
import siteConnection from 'calypso/state/site-connection/reducer';
import { reducer as ui } from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import PluginsBrowser from '../';

const initialReduxState = {
	plugins: {
		installed: {
			isRequesting: {},
			plugins: {},
			status: {},
		},
	},
	ui: { selectedSiteId: 1 },
	siteConnection: { items: { 1: true } },
	sites: {
		items: { 1: { ID: 1, title: 'Test Site', plan: { productSlug: PLAN_FREE } } },
	},
	currentUser: { capabilities: { 1: { manage_options: true } } },
	documentHead: {},
	productsList: {},
};

const render = ( el, options = {} ) =>
	renderWithProvider( el, {
		...options,
		initialState: merge( initialReduxState, options.initialState ),
		reducers: { ui, plugins, documentHead, productsList, siteConnection },
	} );

window.__i18n_text_domain__ = JSON.stringify( 'default' );
window.IntersectionObserver = jest.fn( () => ( { observe: jest.fn(), disconnect: jest.fn() } ) );

describe( 'Search view', () => {
	const myProps = {
		search: 'searchterm',
	};

	test( 'should show NoResults when there are no results', () => {
		render( <PluginsBrowser { ...myProps } /> );
		expect( screen.getByText( /no matches found/i ) ).toBeVisible();
	} );
	test( 'should show plugin list when there are results', () => {
		mockPlugins = [ {} ];
		render( <PluginsBrowser { ...myProps } /> );
		expect( screen.getByText( /found 0 plugins for/i ) ).toBeVisible();
	} );
} );

describe( 'Upsell Nudge should get appropriate plan constant', () => {
	test.each( [ PLAN_FREE, PLAN_BLOGGER, PLAN_PERSONAL, PLAN_PREMIUM ] )(
		`Business 1 year for (%s)`,
		( product_slug ) => {
			const initialState = {
				sites: {
					items: { 1: { jetpack: false, plan: { product_slug } } },
					features: { 1: { data: [ FEATURE_INSTALL_PLUGINS ] } },
				},
			};
			render( <PluginsBrowser />, { initialState } );
			const nudge = screen.getByTestId( 'upsell-nudge' );
			expect( nudge ).toBeVisible();
			expect( nudge ).toHaveTextContent( PLAN_BUSINESS );
		}
	);

	test.each( [ PLAN_BLOGGER_2_YEARS, PLAN_PERSONAL_2_YEARS, PLAN_PREMIUM_2_YEARS ] )(
		`Business 2 year for (%s)`,
		( product_slug ) => {
			const initialState = {
				sites: { items: { 1: { jetpack: false, plan: { product_slug } } } },
			};
			render( <PluginsBrowser />, { initialState } );
			const nudge = screen.getByTestId( 'upsell-nudge' );
			expect( nudge ).toBeVisible();
			expect( nudge ).toHaveTextContent( PLAN_BUSINESS_2_YEARS );
		}
	);
} );

describe( 'PluginsBrowser basic tests', () => {
	test( 'should not blow up and have proper CSS class', () => {
		render( <PluginsBrowser /> );
		const main = screen.getByRole( 'main' );
		expect( main ).toBeVisible();
	} );

	test( 'should show upsell nudge when appropriate', () => {
		render( <PluginsBrowser /> );
		expect( screen.getByTestId( 'upsell-nudge' ) ).toBeVisible();
	} );

	test( 'should not show upsell nudge if no site is selected', () => {
		const initialState = { ui: { selectedSiteId: null } };
		render( <PluginsBrowser />, { initialState } );
		expect( screen.queryByTestId( 'upsell-nudge' ) ).not.toBeInTheDocument();
	} );

	test( 'should not show upsell nudge if no sitePlan', () => {
		const initialState = {
			ui: { selectedSiteId: 10 },
			sites: { items: { 10: { ID: 10, plan: null } } },
		};
		render( <PluginsBrowser />, { initialState } );
		expect( screen.queryByTestId( 'upsell-nudge' ) ).not.toBeInTheDocument();
	} );

	test( 'should not show upsell nudge if non-atomic jetpack site', () => {
		const initialState = {
			sites: { items: { 1: { jetpack: true } } },
		};
		render( <PluginsBrowser />, { initialState } );
		expect( screen.queryByTestId( 'upsell-nudge' ) ).not.toBeInTheDocument();
	} );

	test( 'should not show upsell nudge has business plan', () => {
		const initialState = {
			sites: { items: { 1: { jetpack: true, plan: { productSlug: PLAN_PREMIUM } } } },
		};
		render( <PluginsBrowser />, { initialState } );
		expect( screen.queryByTestId( 'upsell-nudge' ) ).not.toBeInTheDocument();
	} );

	test( 'should show notice if site is not connected to wpcom', () => {
		const initialState = {
			ui: { selectedSiteId: 1 },
			siteConnection: { items: { 1: false } },
			sites: {
				items: { 1: { jetpack: false } },
			},
		};
		render( <PluginsBrowser />, { initialState } );
		expect( screen.getByText( 'I’d like to fix this now' ) ).toBeVisible();
	} );
} );
