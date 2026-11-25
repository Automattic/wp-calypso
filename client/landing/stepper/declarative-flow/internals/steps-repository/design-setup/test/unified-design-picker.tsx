/**
 * @vitest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { vi } from 'vitest';
import * as wpcomProxyRequest from 'wpcom-proxy-request';
import wpcomXhrRequest from 'wpcom-xhr-request';
import {
	MOCKED_SITE,
	generateMockedStarterDesignDetails,
	generateMockedStarterDesigns,
} from '../mocks';
import UnifiedDesignPickerStep from '../unified-design-picker';

vi.mock( '@automattic/global-styles', () => ( {
	useColorPaletteVariations: vi.fn( () => [] ),
	useFontPairingVariations: vi.fn( () => [] ),
} ) );

vi.mock( '@wordpress/compose', async () => ( {
	...( await vi.importActual< typeof import( '@wordpress/compose' ) >( '@wordpress/compose' ) ),
	useViewportMatch: vi.fn( () => false ),
} ) );

vi.mock(
	'wpcom-proxy-request',
	async () =>
		await vi.importActual< typeof import( 'wpcom-proxy-request' ) >( 'wpcom-proxy-request' )
);

vi.mock( '../../../../../hooks/use-site', () => ( {
	useSite: () => MOCKED_SITE,
} ) );

vi.mock( 'calypso/state/sites/hooks/use-site-global-styles-status', () => ( {
	useSiteGlobalStylesStatus: () => ( { shouldLimitGlobalStyles: false } ),
} ) );

vi.mock( 'calypso/lib/explat', () => ( {
	useExperiment: () => [ false, null ],
} ) );

vi.mock( 'calypso/state/automated-transfer/selectors', () => ( {
	getEligibility: () => {
		return;
	},
} ) );

vi.mock( 'calypso/components/data/query-themes', () =>
	( ( m ) => ( { ...m, default: m } ) )( {
		useQueryThemes: () => {
			return;
		},
	} )
);

vi.mock( 'calypso/state/themes/hooks/use-is-theme-allowed-on-site', () => ( {
	useIsThemeAllowedOnSite: () => false,
} ) );

vi.mock( 'calypso/state/themes/selectors/get-theme', () => ( {
	getTheme: () => {
		return;
	},
} ) );

vi.mock( 'calypso/state/themes/selectors/get-theme-demo-url', () => ( {
	getThemeDemoUrl: () => {
		return;
	},
} ) );

/**
 * Mock wpcom-proxy-request so that we could use wpcom-xhr-request to call the endpoint
 * and get the response from nock
 */
vi.spyOn( wpcomProxyRequest, 'default' ).mockImplementation(
	( ...args ) =>
		new Promise( ( resolve, reject ) =>
			wpcomXhrRequest( ...args, ( err, res ) => ( err ? reject( err ) : resolve( res ) ) )
		)
);

const middlewares = [ thunk ];

const mockStore = configureStore( middlewares );

const renderComponent = ( component, initialState = {} ) => {
	const queryClient = new QueryClient();
	const store = mockStore( {
		purchases: {},
		productsList: {
			isFetching: false,
		},
		sites: {},
		ui: { selectedSiteId: 'anySiteId' },
		...initialState,
	} );

	const initialEntries = [ '/setup/site-setup/design-setup?siteSlug=test.wordpress.com' ];

	return render(
		<Provider store={ store }>
			<QueryClientProvider client={ queryClient }>
				<MemoryRouter initialEntries={ initialEntries }>{ component }</MemoryRouter>
			</QueryClientProvider>
		</Provider>
	);
};

describe( 'UnifiedDesignPickerStep', () => {
	let originalScrollTo;

	const navigation = {
		goBack: vi.fn(),
		goNext: vi.fn(),
		submit: vi.fn(),
	};

	beforeAll( () => {
		originalScrollTo = window.scrollTo;
		window.scrollTo = vi.fn();

		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( '/wpcom/v2/starter-designs' )
			.query( true )
			.reply( 200, generateMockedStarterDesigns );

		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( /\/wpcom\/v2\/starter-designs\/\w+/ )
			.query( true )
			.reply( 200, generateMockedStarterDesignDetails );

		const mockIntersectionObserver = vi.fn( function () {
			return {
				observe: () => null,
				unobserve: () => null,
				disconnect: () => null,
			};
		} );
		window.IntersectionObserver = mockIntersectionObserver;
	} );

	afterAll( () => {
		window.scrollTo = originalScrollTo;

		nock.cleanAll();
	} );

	afterEach( () => {
		vi.clearAllMocks();
	} );

	describe( 'Basics', () => {
		it( 'should render successfully', async () => {
			const { container } = renderComponent(
				<UnifiedDesignPickerStep flow="site-setup" navigation={ navigation } />
			);

			await waitFor( () => {
				expect( screen.getByText( 'Pick a theme' ) ).toBeInTheDocument();
				expect( container.getElementsByClassName( 'unified-design-picker__designs' ) ).toHaveLength(
					1
				);
			} );
		} );
	} );
} );
