/**
 * @jest-environment jsdom
 */
jest.mock( 'calypso/components/data/document-head', () => 'document-head' );
jest.mock( 'calypso/lib/analytics/page-view-tracker', () => 'page-view-tracker' );
jest.mock( 'calypso/components/feature-example', () => ( { children } ) => {
	return <div data-testid="feature-example-wrapper">{ children }</div>;
} );
jest.mock( 'calypso/lib/wp', () => ( {
	req: {
		get: jest.fn(),
	},
} ) );

import {
	FEATURE_SFTP,
	FEATURE_SITE_STAGING_SITES,
	PLAN_BUSINESS_MONTHLY,
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
	PLAN_FREE,
	PLAN_PERSONAL,
	WPCOM_FEATURES_ATOMIC,
} from '@automattic/calypso-products';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import wp from 'calypso/lib/wp';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import Hosting from '../main';

const wpcomGetStub = wp.req.get;

const getTestConfig = ( {
	isAtomicSite = false,
	isWpcomStagingSite = false,
	planSlug = PLAN_FREE,
	siteFeatures = [],
	transferStatus = transferStates.NONE,
} ) => {
	wpcomGetStub.mockResolvedValue( {
		status: transferStatus,
	} );

	return {
		isAtomicSite,
		isWpcomStagingSite,
		planSlug,
		siteFeatures,
		transferStatus,
	};
};

const createTestStore = ( {
	isAtomicSite,
	isWpcomStagingSite,
	planSlug,
	siteFeatures,
	transferStatus,
} ) => {
	const TEST_SITE_ID = 1;
	const middlewares = [ thunk ];

	const mockStore = configureStore( middlewares );
	const store = mockStore( {
		atomicHosting: {
			[ TEST_SITE_ID ]: {
				isLoadingSftpUsers: false,
				isLoadingSshAccess: false,
			},
		},
		automatedTransfer: {
			[ TEST_SITE_ID ]: {
				status: transferStatus,
			},
		},
		documentHead: { unreadCount: 0 },
		ui: { selectedSiteId: TEST_SITE_ID },
		currentUser: {
			capabilities: {
				[ TEST_SITE_ID ]: {
					manage_options: true,
				},
			},
			id: 1,
		},
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
			plans: {
				[ TEST_SITE_ID ]: {
					data: [
						{
							currentPlan: true,
							productSlug: planSlug,
						},
					],
				},
			},
			requesting: {
				[ TEST_SITE_ID ]: true,
			},
		},
		preferences: {},
	} );
	return store;
};

const renderComponentWithStoreAndQueryClient = ( store ) => {
	render(
		<Provider store={ store }>
			<QueryClientProvider client={ new QueryClient() }>
				<Hosting />
			</QueryClientProvider>
		</Provider>
	);
};

const stringsForBasicFeatureCards = [ 'Restore plugins and themes', 'Clear all caches' ];

describe( 'Hosting Configuration', () => {
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

		// Mock `ResizeObserver`, which isn't currently supported in JSDOM
		Object.defineProperty( global, 'ResizeObserver', {
			writable: false,
			value: jest.fn().mockImplementation( () => ( {
				observe: jest.fn(),
				unobserve: jest.fn(),
				disconnect: jest.fn(),
			} ) ),
		} );
	} );

	afterAll( () => {
		jest.resetAllMocks();
	} );

	describe( 'Site on free plan', () => {
		it( 'should show upsell banner and all cards should be within FeatureExample', async () => {
			const testConfig = getTestConfig( { planSlug: PLAN_FREE } );

			renderComponentWithStoreAndQueryClient( createTestStore( testConfig ) );
			await waitFor( () => expect( wpcomGetStub ).toHaveBeenCalled() );

			expect(
				await screen.findByText( 'Upgrade to the Business plan to access all hosting features:' )
			).toBeVisible();
			expect( screen.getByText( 'Upgrade to Business Plan' ) ).toBeVisible();

			const [ mainFeatureExampleElement ] = screen.getAllByTestId( 'feature-example-wrapper' );

			expect( mainFeatureExampleElement ).toBeVisible();
		} );
	} );

	describe( 'Site on Personal plan', () => {
		it( 'should show upsell banner and all cards should be within FeatureExample', async () => {
			const testConfig = getTestConfig( { planSlug: PLAN_PERSONAL } );

			renderComponentWithStoreAndQueryClient( createTestStore( testConfig ) );
			await waitFor( () => expect( wpcomGetStub ).toHaveBeenCalled() );

			expect(
				await screen.findByText( 'Upgrade to the Business plan to access all hosting features:' )
			).toBeVisible();

			expect( screen.getByText( 'Upgrade to Business Plan' ) ).toBeVisible();

			const [ mainFeatureExampleElement ] = screen.getAllByTestId( 'feature-example-wrapper' );

			expect( mainFeatureExampleElement ).toBeVisible();
		} );
	} );

	describe( 'Site on Business plan', () => {
		it( 'should show activation notice when the site is not Atomic', async () => {
			const testConfig = getTestConfig( {
				planSlug: PLAN_BUSINESS_MONTHLY,
				siteFeatures: [ WPCOM_FEATURES_ATOMIC, FEATURE_SFTP, FEATURE_SITE_STAGING_SITES ],
				transferStatus: 'none',
			} );

			renderComponentWithStoreAndQueryClient( createTestStore( testConfig ) );
			await waitFor( () => expect( wpcomGetStub ).toHaveBeenCalled() );

			expect(
				screen.getByText( 'Please activate the hosting access to begin using these features.' )
			).toBeVisible();
			expect( screen.getByText( 'Activate' ) ).toBeVisible();

			const [ mainFeatureExampleElement ] = screen.getAllByTestId( 'feature-example-wrapper' );

			expect( mainFeatureExampleElement ).toBeVisible();
		} );

		it( 'should not show the activation notice when the site is Atomic', async () => {
			const testConfig = getTestConfig( {
				isAtomicSite: true,
				planSlug: PLAN_BUSINESS_MONTHLY,
				siteFeatures: [ WPCOM_FEATURES_ATOMIC, FEATURE_SFTP, FEATURE_SITE_STAGING_SITES ],
				transferStatus: transferStates.COMPLETE,
			} );

			renderComponentWithStoreAndQueryClient( createTestStore( testConfig ) );
			await waitFor( () => expect( wpcomGetStub ).toHaveBeenCalled() );

			expect(
				screen.queryByText( 'Please activate the hosting access to begin using these features.' )
			).toBeNull();
			expect( screen.queryByText( 'Activate' ) ).toBeNull();
			expect( screen.queryByTestId( 'feature-example-wrapper' ) ).toBeNull();
		} );

		it( 'should show the transferring notice when the site is transferring to Atomic', async () => {
			const testConfig = getTestConfig( {
				isAtomicSite: false,
				planSlug: PLAN_BUSINESS_MONTHLY,
				siteFeatures: [ WPCOM_FEATURES_ATOMIC, FEATURE_SFTP, FEATURE_SITE_STAGING_SITES ],
				transferStatus: transferStates.START,
			} );

			renderComponentWithStoreAndQueryClient( createTestStore( testConfig ) );
			await waitFor( () => expect( wpcomGetStub ).toHaveBeenCalled() );

			expect(
				screen.getByText( 'Please wait while we activate the hosting features.' )
			).toBeVisible();

			const [ mainFeatureExampleElement ] = screen.getAllByTestId( 'feature-example-wrapper' );

			expect( mainFeatureExampleElement ).toBeVisible();
		} );
	} );

	describe( 'Site on Woo Express/eCommerce Trial plan', () => {
		it( 'should show the upsell banner with alternate text and show the basic features', async () => {
			const testConfig = getTestConfig( {
				isAtomicSite: true,
				planSlug: PLAN_ECOMMERCE_TRIAL_MONTHLY,
				siteFeatures: [ WPCOM_FEATURES_ATOMIC ],
				transferStatus: transferStates.COMPLETE,
			} );

			renderComponentWithStoreAndQueryClient( createTestStore( testConfig ) );
			await waitFor( () => expect( wpcomGetStub ).toHaveBeenCalled() );

			expect(
				screen.getByText( 'Upgrade your plan to access all hosting features' )
			).toBeVisible();
			expect( screen.getByText( 'Upgrade your plan' ) ).toBeVisible();

			const [ mainFeatureExampleElement ] = screen.getAllByTestId( 'feature-example-wrapper' );

			expect( mainFeatureExampleElement ).toBeVisible();

			stringsForBasicFeatureCards.forEach( ( string ) => {
				const elementForString = screen.getByText( string );
				expect( elementForString ).toBeVisible();
				expect( mainFeatureExampleElement ).not.toContainElement( elementForString );
			} );
		} );
	} );
} );
