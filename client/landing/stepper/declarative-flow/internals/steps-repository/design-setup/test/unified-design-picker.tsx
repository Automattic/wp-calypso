/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import * as wpcomProxyRequest from 'wpcom-proxy-request';
import wpcomXhrRequest from 'wpcom-xhr-request';
import {
	MOCKED_SITE,
	generateMockedStarterDesignDetails,
	generateMockedStarterDesigns,
} from '../mocks';
import UnifiedDesignPickerStep from '../unified-design-picker';

jest.mock( '@automattic/global-styles', () => ( {
	useColorPaletteVariations: jest.fn( () => [] ),
	useFontPairingVariations: jest.fn( () => [] ),
} ) );

jest.mock( '@wordpress/compose', () => ( {
	...jest.requireActual( '@wordpress/compose' ),
	useViewportMatch: jest.fn( () => false ),
} ) );

jest.mock( 'wpcom-proxy-request', () => jest.requireActual( 'wpcom-proxy-request' ) );

jest.mock( '../../../../../hooks/use-site', () => ( {
	useSite: () => MOCKED_SITE,
} ) );

jest.mock( 'calypso/state/sites/hooks/use-site-global-styles-status', () => ( {
	useSiteGlobalStylesStatus: () => ( { shouldLimitGlobalStyles: false } ),
} ) );

jest.mock( 'calypso/lib/explat', () => ( {
	useExperiment: () => [ false, null ],
} ) );

jest.mock( 'calypso/state/themes/theme-utils', () => ( {
	getPreferredBillingCycleProductSlug: () => {
		return;
	},
} ) );

jest.mock( 'calypso/state/automated-transfer/selectors', () => ( {
	getEligibility: () => {
		return;
	},
} ) );

jest.mock( 'calypso/state/products-list/selectors', () => ( {
	...jest.requireActual( 'calypso/state/products-list/selectors' ),
	getProductBillingSlugByThemeId: () => {
		return;
	},
} ) );

jest.mock( 'calypso/components/data/query-site-features', () => ( {
	useQuerySiteFeatures: () => {
		return;
	},
} ) );

jest.mock( 'calypso/components/data/query-themes', () => ( {
	useQueryThemes: () => {
		return;
	},
} ) );

jest.mock( 'calypso/components/data/query-products-list', () => ( {
	useQueryProductsList: () => {
		return;
	},
} ) );

jest.mock( 'calypso/state/themes/hooks/use-is-theme-allowed-on-site', () => ( {
	useIsThemeAllowedOnSite: () => false,
} ) );

jest.mock( 'calypso/state/themes/selectors', () => ( {
	isMarketplaceThemeSubscribed: () => {
		return;
	},
	getTheme: () => {
		return;
	},
	isSiteEligibleForManagedExternalThemes: () => {
		return;
	},
} ) );

/**
 * Mock wpcom-proxy-request so that we could use wpcom-xhr-request to call the endpoint
 * and get the response from nock
 */
jest
	.spyOn( wpcomProxyRequest, 'default' )
	.mockImplementation(
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
		sites: {},
		ui: { selectedSiteId: 'anySiteId' },
		...initialState,
	} );

	const initialEntries = [ `/setup/site-setup/designSetup?siteSlug=test.wordpress.com` ];

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
		goBack: jest.fn(),
		goNext: jest.fn(),
		submit: jest.fn(),
	};

	beforeAll( () => {
		originalScrollTo = window.scrollTo;
		window.scrollTo = jest.fn();

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

		const mockIntersectionObserver = jest.fn();
		mockIntersectionObserver.mockReturnValue( {
			observe: () => null,
			unobserve: () => null,
			disconnect: () => null,
		} );
		window.IntersectionObserver = mockIntersectionObserver;
	} );

	afterAll( () => {
		window.scrollTo = originalScrollTo;

		nock.cleanAll();
	} );

	afterEach( () => {
		jest.clearAllMocks();
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
