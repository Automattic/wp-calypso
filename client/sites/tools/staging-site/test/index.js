/**
 * @jest-environment jsdom
 */
jest.mock( 'calypso/sites/tools/staging-site/components/staging-site-card', () => () => (
	<div data-testid="staging-site-card">
		<span>Staging site</span>
	</div>
) );
jest.mock(
	'calypso/sites/tools/staging-site/components/staging-site-card/staging-site-production-card',
	() => () => (
		<div data-testid="staging-site-production-card">
			<span>Staging site</span>
		</div>
	)
);

import { FEATURE_SITE_STAGING_SITES } from '@automattic/calypso-products';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import StagingSite from '../components/staging-site';

const getTestConfig = ( {
	isAtomicSite = false,
	isWpcomStagingSite = false,
	siteFeatures = [],
} ) => {
	return {
		isAtomicSite,
		isWpcomStagingSite,
		siteFeatures,
	};
};

const createTestStore = ( { isAtomicSite, isWpcomStagingSite, siteFeatures } ) => {
	const TEST_SITE_ID = 1;
	const middlewares = [ thunk ];

	const mockStore = configureStore( middlewares );
	const store = mockStore( {
		ui: { selectedSiteId: TEST_SITE_ID },
		sites: {
			features: {
				[ TEST_SITE_ID ]: {
					data: {
						active: siteFeatures,
					},
				},
			},
			items: {
				[ TEST_SITE_ID ]: {
					is_wpcom_staging_site: isWpcomStagingSite,
					jetpack: false,
					options: {
						is_automated_transfer: isAtomicSite,
						is_wpcom_atomic: isAtomicSite,
					},
					URL: 'test-site-example.wordpress.com',
				},
			},
			requesting: {
				[ TEST_SITE_ID ]: true,
			},
		},
	} );
	return store;
};

const renderComponentWithStoreAndQueryClient = ( store ) => {
	render(
		<Provider store={ store }>
			<QueryClientProvider client={ new QueryClient() }>
				<StagingSite />
			</QueryClientProvider>
		</Provider>
	);
};

describe( 'Staging Site', () => {
	beforeAll( () => {
		// Mock the missing `window.matchMedia` function that's not even in JSDOM
		Object.defineProperty( window, 'matchMedia', {
			writable: true,
			value: jest.fn().mockImplementation( ( query ) => ( {
				matches: false,
				media: query,
				onchange: null,
				addListener: jest.fn(), // deprecated
				removeListener: jest.fn(), // deprecated
				addEventListener: jest.fn(),
				removeEventListener: jest.fn(),
				dispatchEvent: jest.fn(),
			} ) ),
		} );
	} );

	afterAll( () => {
		jest.resetAllMocks();
	} );

	it( 'should show the primary site card and not show the upsell nudge', async () => {
		const testConfig = getTestConfig( {
			isAtomicSite: true,
			isWpcomStagingSite: true,
			siteFeatures: [ FEATURE_SITE_STAGING_SITES ],
		} );

		renderComponentWithStoreAndQueryClient( createTestStore( testConfig ) );

		expect(
			screen.queryByText( 'Upgrade to the Creator plan to access all hosting features:' )
		).toBeNull();
		expect( screen.queryByText( 'Upgrade to Creator Plan' ) ).toBeNull();

		expect( screen.getByTestId( 'staging-site-production-card' ) ).toBeVisible();
	} );
} );
