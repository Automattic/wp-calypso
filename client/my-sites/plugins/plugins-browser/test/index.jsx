/** @jest-environment jsdom */

jest.mock( '@automattic/calypso-router' );
jest.mock( 'calypso/components/infinite-scroll', () => () => (
	<div data-testid="infinite-scroll" />
) );
jest.mock( 'calypso/components/async-load', () => ( { require } ) => (
	<div data-testid="async-load" data-loader={ require.name } />
) );
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
	useESPlugins: jest.fn( () => ( {
		data: { plugins: mockPlugins, pagination: { page: 1, pages: 1, results: 0 } },
	} ) ),
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
	isFetchingSitePurchases: jest.fn( () => false ),
} ) );

jest.mock( 'calypso/my-sites/plugins/use-preinstalled-premium-plugin', () =>
	jest.fn( () => ( { usePreinstalledPremiumPlugin: jest.fn() } ) )
);

jest.mock( 'calypso/lib/route/path', () => ( {
	...jest.requireActual( 'calypso/lib/route/path' ),
	getMessagePathForJITM: jest.fn( () => '/plugins/' ),
} ) );

import config from '@automattic/calypso-config';
import {
	FEATURE_INSTALL_PLUGINS,
	PLAN_FREE,
	PLAN_BUSINESS,
	PLAN_PREMIUM,
	PLAN_PERSONAL,
	PLAN_BLOGGER,
	WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS,
} from '@automattic/calypso-products';
import { merge } from '@automattic/js-utils';
import { screen } from '@testing-library/react';
import { useESPlugins, useESPluginsInfinite } from 'calypso/data/marketplace/use-es-query';
import documentHead from 'calypso/state/document-head/reducer';
import { reducer as jetpackConnectionHealth } from 'calypso/state/jetpack-connection-health/reducer';
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
		reducers: { ui, plugins, documentHead, productsList, siteConnection, jetpackConnectionHealth },
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
		`Cheapest plan for (%s)`,
		( product_slug ) => {
			const initialState = {
				sites: {
					items: { 1: { jetpack: false, plan: { product_slug } } },
					features: {
						1: {
							data: {
								active: [],
								available: {
									[ FEATURE_INSTALL_PLUGINS ]: [ PLAN_PERSONAL ],
									[ WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS ]: [ PLAN_PERSONAL ],
								},
							},
						},
					},
				},
			};
			render( <PluginsBrowser />, { initialState } );
			const nudge = screen.getByTestId( 'upsell-nudge' );
			expect( nudge ).toBeVisible();
			expect( nudge ).toHaveTextContent( PLAN_PERSONAL );
		}
	);

	test( 'should use business plan when it is the cheapest for the feature', () => {
		const initialState = {
			sites: {
				items: { 1: { jetpack: false, plan: { product_slug: PLAN_FREE } } },
				features: {
					1: {
						data: {
							active: [],
							available: {
								[ FEATURE_INSTALL_PLUGINS ]: [ PLAN_BUSINESS ],
								[ WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS ]: [ PLAN_BUSINESS ],
							},
						},
					},
				},
			},
		};
		render( <PluginsBrowser />, { initialState } );
		const nudge = screen.getByTestId( 'upsell-nudge' );
		expect( nudge ).toBeVisible();
		expect( nudge ).toHaveTextContent( PLAN_BUSINESS );
	} );
} );

describe( 'PluginsBrowser basic tests', () => {
	test( 'shows Describe for logged-in users', () => {
		render( <PluginsBrowser category="describe" />, {
			initialState: { currentUser: { id: 1 } },
		} );
		expect( screen.getByTestId( 'async-load' ) ).toHaveAttribute(
			'data-loader',
			'loadMarketplaceAIExperience'
		);
	} );

	test( 'does not show Describe for logged-out users', () => {
		render( <PluginsBrowser category="describe" />, {
			initialState: { currentUser: { id: null } },
		} );
		expect(
			document.querySelector( '[data-loader="loadMarketplaceAIExperience"]' )
		).not.toBeInTheDocument();
	} );

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
		const lastRequestTime = Date.now() - 1000 * 60 * 4;
		const initialState = {
			ui: { selectedSiteId: 1 },
			jetpackConnectionHealth: {
				1: {
					lastRequestTime,
					connectionHealth: {
						jetpack_connection_problem: true,
						error: 'test',
					},
				},
			},
			sites: {
				items: { 1: { jetpack: true } },
			},
		};
		render( <PluginsBrowser />, { initialState } );
		expect( screen.getByText( 'Learn how to fix' ) ).toBeVisible();
	} );
} );

describe( 'Marketplace pagination', () => {
	test.each(
		[
			[ 'Simple', { jetpack: false, options: { is_automated_transfer: false } } ],
			[ 'Atomic', { jetpack: true, options: { is_automated_transfer: true } } ],
			[ 'self-hosted Jetpack', { jetpack: true, options: { is_automated_transfer: false } } ],
		].flatMap( ( [ hosting, site ] ) =>
			[ 'category', 'search' ].map( ( view ) => [ hosting, view, site ] )
		)
	)( 'retains signed-in scrolling for %s %s results', ( hosting, view, site ) => {
		const original = useESPluginsInfinite.getMockImplementation();
		useESPluginsInfinite.mockReturnValue( {
			data: { plugins: [ { slug: 'jetpack', name: 'Jetpack', railcar: {} } ] },
			fetchNextPage: jest.fn(),
		} );
		render(
			<PluginsBrowser
				category={ view === 'category' ? 'seo' : undefined }
				search={ view === 'search' ? 'jetpack' : undefined }
				page={ 2 }
			/>,
			{
				initialState: {
					currentUser: { id: 1 },
					ui: { selectedSiteId: 1 },
					sites: { items: { 1: site } },
				},
			}
		);
		expect( screen.getByTestId( 'infinite-scroll' ) ).toBeVisible();
		expect( screen.queryByRole( 'navigation', { name: 'Plugin result pages' } ) ).toBeNull();
		expect( useESPlugins ).toHaveBeenLastCalledWith(
			expect.objectContaining( { page: undefined } ),
			{ enabled: false }
		);
		expect( useESPluginsInfinite ).toHaveBeenLastCalledWith( expect.anything(), { enabled: true } );
		useESPluginsInfinite.mockImplementation( original );
	} );

	test.each( [ 'loading', 'empty', 'error' ] )(
		'handles logged-out search %s states',
		( status ) => {
			const original = useESPlugins.getMockImplementation();
			const retry = jest.fn();
			useESPlugins.mockReturnValue( {
				data:
					status === 'empty'
						? { plugins: [], pagination: { page: 2, pages: 1, results: 8 } }
						: undefined,
				isLoading: status === 'loading',
				isError: status === 'error',
				refetch: retry,
			} );
			render( <PluginsBrowser search="form" path="/plugins?s=form&page=2" page={ 2 } />, {
				initialState: { currentUser: { id: null }, ui: { selectedSiteId: null } },
			} );
			expect( screen.queryByText( 'No matches found' ) ).toBeNull();
			expect( screen.queryByRole( 'navigation', { name: 'Plugin result pages' } ) ).toBeNull();
			const messages = { loading: 'Search Results', empty: 'Go to the first page', error: 'Retry' };
			expect( screen.getByText( messages[ status ] ) ).toBeVisible();
			useESPlugins.mockImplementation( original );
		}
	);
	test.each( [ 'category', 'search' ] )( 'paginates logged-out %s results', ( view ) => {
		const original = useESPlugins.getMockImplementation();
		useESPlugins.mockReturnValue( {
			data: {
				plugins: [ { slug: 'jetpack', name: 'Jetpack' } ],
				pagination: { page: 2, pages: 3, results: 45 },
			},
		} );
		render(
			<PluginsBrowser
				category={ view === 'category' ? 'seo' : undefined }
				search={ view === 'search' ? 'form' : undefined }
				path="/es/plugins/browse/seo?s=form&page=2&source=test"
				page={ 2 }
			/>,
			{
				initialState: { currentUser: { id: null }, ui: { selectedSiteId: null } },
			}
		);
		expect( screen.getByText( 'Page 2 of 3' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Next' } ) ).toHaveAttribute(
			'href',
			'/es/plugins/browse/seo?s=form&page=3&source=test'
		);
		expect( screen.queryByTestId( 'infinite-scroll' ) ).toBeNull();
		expect( useESPlugins ).toHaveBeenLastCalledWith( expect.objectContaining( { page: 2 } ), {
			enabled: true,
		} );
		expect( useESPluginsInfinite ).toHaveBeenLastCalledWith( expect.anything(), {
			enabled: false,
		} );
		useESPlugins.mockImplementation( original );
	} );

	test( 'retains scrolling for signed-in visitors with the logged-out-looking header', () => {
		const original = config.isEnabled;
		const spy = jest
			.spyOn( config, 'isEnabled' )
			.mockImplementation(
				( feature ) => feature === 'plugins/universal-header' || original( feature )
			);
		render( <PluginsBrowser category="seo" page={ 2 } />, {
			initialState: {
				currentUser: { id: 1 },
				ui: { selectedSiteId: null },
				preferences: { localValues: { 'hosting-dashboard-opt-in': { value: 'opt-in' } } },
			},
		} );
		expect( screen.getByTestId( 'infinite-scroll' ) ).toBeVisible();
		expect( screen.queryByRole( 'navigation', { name: 'Plugin result pages' } ) ).toBeNull();
		expect( useESPlugins ).toHaveBeenLastCalledWith(
			expect.objectContaining( { page: undefined } ),
			{ enabled: false }
		);
		expect( useESPluginsInfinite ).toHaveBeenLastCalledWith( expect.anything(), { enabled: true } );
		spy.mockRestore();
	} );
} );
