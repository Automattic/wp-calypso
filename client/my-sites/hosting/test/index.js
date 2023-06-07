/**
 * @jest-environment jsdom
 */
jest.mock( 'calypso/components/data/document-head', () => 'document-head' );
jest.mock( 'calypso/lib/analytics/page-view-tracker', () => 'page-view-tracker' );
jest.mock( 'calypso/components/feature-example', () => ( { children } ) => {
	return <div data-testid="feature-example-wrapper">{ children }</div>;
} );
jest.mock( '../staging-site-card', () => () => (
	<div data-testid="staging-site-card">
		<span>Staging site</span>
	</div>
) );
jest.mock( '../staging-site-card/staging-site-production-card', () => () => (
	<div data-testid="staging-site-production-card">
		<span>Staging site</span>
	</div>
) );

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
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import Hosting from '../main';

const getTestConfig = ( {
	isAtomicSite = false,
	isWpcomStagingSite = false,
	planSlug = PLAN_FREE,
	siteFeatures = [],
	transferState = transferStates.NONE,
} ) => {
	return {
		isAtomicSite,
		isWpcomStagingSite,
		planSlug,
		siteFeatures,
		transferState,
	};
};

const createTestStore = ( {
	isAtomicSite,
	isWpcomStagingSite,
	planSlug,
	siteFeatures,
	transferState,
} ) => {
	const TEST_SITE_ID = 1;
	return createStore( ( state ) => state, {
		atomicHosting: {
			[ TEST_SITE_ID ]: {
				isLoadingSftpUsers: false,
			},
		},
		automatedTransfer: {
			[ TEST_SITE_ID ]: {
				status: transferState,
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
		},
	} );
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

const stringsForAdvancedFeatureCards = [ 'Database access', 'Web server settings' ];

const stringsForBasicFeatureCards = [ 'Restore plugins and themes', 'Clear cache' ];

const stringsForAllAtomicFeatureCards = [
	...stringsForAdvancedFeatureCards,
	...stringsForBasicFeatureCards,
];

const getExpectedStringsForTestConfig = ( testConfig, { enabledOnly = false } = {} ) => {
	let expectedStrings = [];

	if ( enabledOnly ) {
		if ( testConfig.siteFeatures.includes( FEATURE_SFTP ) ) {
			expectedStrings = stringsForAllAtomicFeatureCards;
		} else if ( testConfig.siteFeatures.includes( WPCOM_FEATURES_ATOMIC ) ) {
			expectedStrings = stringsForBasicFeatureCards;
		}
	} else {
		expectedStrings = stringsForAllAtomicFeatureCards;
	}

	if ( testConfig.siteFeatures.includes( FEATURE_SITE_STAGING_SITES ) ) {
		expectedStrings.push( 'Staging site' );
	}

	return expectedStrings;
};

const verifyStringsAreWithinFeatureExample = ( strings, featureExampleElement ) => {
	strings.forEach( ( string ) => {
		expect( featureExampleElement ).toContainElement( screen.getByText( string ) );
	} );
};

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
	} );

	describe( 'Site on free plan', () => {
		it( 'should show upsell banner and all cards should be within FeatureExample', () => {
			const testConfig = getTestConfig( { planSlug: PLAN_FREE } );

			renderComponentWithStoreAndQueryClient( createTestStore( testConfig ) );

			expect(
				screen.getByText( 'Upgrade to the Business plan to access all hosting features:' )
			).toBeVisible();
			expect( screen.getByText( 'Upgrade to Business Plan' ) ).toBeVisible();

			const [ mainFeatureExampleElement ] = screen.getAllByTestId( 'feature-example-wrapper' );

			expect( mainFeatureExampleElement ).toBeVisible();

			const expectedStrings = getExpectedStringsForTestConfig( testConfig );
			verifyStringsAreWithinFeatureExample( expectedStrings, mainFeatureExampleElement );
		} );
	} );

	describe( 'Site on Personal plan', () => {
		it( 'should show upsell banner and all cards should be within FeatureExample', () => {
			const testConfig = getTestConfig( { planSlug: PLAN_PERSONAL } );
			renderComponentWithStoreAndQueryClient( createTestStore( testConfig ) );

			expect(
				screen.getByText( 'Upgrade to the Business plan to access all hosting features:' )
			).toBeVisible();
			expect( screen.getByText( 'Upgrade to Business Plan' ) ).toBeVisible();

			const [ mainFeatureExampleElement ] = screen.getAllByTestId( 'feature-example-wrapper' );

			expect( mainFeatureExampleElement ).toBeVisible();

			const expectedStrings = getExpectedStringsForTestConfig( testConfig );
			verifyStringsAreWithinFeatureExample( expectedStrings, mainFeatureExampleElement );
		} );
	} );

	describe( 'Site on Business plan', () => {
		it( 'should show activation notice when the site is not Atomic', () => {
			const testConfig = getTestConfig( {
				planSlug: PLAN_BUSINESS_MONTHLY,
				siteFeatures: [ WPCOM_FEATURES_ATOMIC, FEATURE_SFTP, FEATURE_SITE_STAGING_SITES ],
			} );

			renderComponentWithStoreAndQueryClient( createTestStore( testConfig ) );

			expect(
				screen.getByText( 'Please activate the hosting access to begin using these features.' )
			).toBeVisible();
			expect( screen.getByText( 'Activate' ) ).toBeVisible();

			const [ mainFeatureExampleElement ] = screen.getAllByTestId( 'feature-example-wrapper' );

			expect( mainFeatureExampleElement ).toBeVisible();

			const expectedStrings = getExpectedStringsForTestConfig( testConfig );
			verifyStringsAreWithinFeatureExample( expectedStrings, mainFeatureExampleElement );
		} );

		it( 'should not show the activation notice when the site is Atomic', () => {
			const testConfig = getTestConfig( {
				isAtomicSite: true,
				planSlug: PLAN_BUSINESS_MONTHLY,
				siteFeatures: [ WPCOM_FEATURES_ATOMIC, FEATURE_SFTP, FEATURE_SITE_STAGING_SITES ],
				transferState: transferStates.COMPLETE,
			} );

			renderComponentWithStoreAndQueryClient( createTestStore( testConfig ) );

			expect(
				screen.queryByText( 'Please activate the hosting access to begin using these features.' )
			).toBeNull();
			expect( screen.queryByText( 'Activate' ) ).toBeNull();
			expect( screen.queryByTestId( 'feature-example-wrapper' ) ).toBeNull();

			const expectedStrings = getExpectedStringsForTestConfig( testConfig, { enabledOnly: true } );
			expectedStrings.forEach( ( string ) => {
				expect( screen.getByText( string ) ).toBeVisible();
			} );
		} );

		it( 'should show the transferring notice when the site is transferring to Atomic', () => {
			const testConfig = getTestConfig( {
				isAtomicSite: false,
				planSlug: PLAN_BUSINESS_MONTHLY,
				siteFeatures: [ WPCOM_FEATURES_ATOMIC, FEATURE_SFTP, FEATURE_SITE_STAGING_SITES ],
				transferState: transferStates.START,
			} );

			renderComponentWithStoreAndQueryClient( createTestStore( testConfig ) );

			expect(
				screen.getByText( 'Please wait while we activate the hosting features.' )
			).toBeVisible();

			const [ mainFeatureExampleElement ] = screen.getAllByTestId( 'feature-example-wrapper' );

			expect( mainFeatureExampleElement ).toBeVisible();

			const expectedStrings = getExpectedStringsForTestConfig( testConfig );
			verifyStringsAreWithinFeatureExample( expectedStrings, mainFeatureExampleElement );
		} );
	} );

	describe( 'Site on Woo Express/eCommerce Trial plan', () => {
		it( 'should show the upsell banner with alternate text and show the basic features', () => {
			const testConfig = getTestConfig( {
				isAtomicSite: true,
				planSlug: PLAN_ECOMMERCE_TRIAL_MONTHLY,
				siteFeatures: [ WPCOM_FEATURES_ATOMIC ],
				transferState: transferStates.COMPLETE,
			} );

			renderComponentWithStoreAndQueryClient( createTestStore( testConfig ) );

			expect(
				screen.getByText( 'Upgrade your plan to access all hosting features' )
			).toBeVisible();
			expect( screen.getByText( 'Upgrade your plan' ) ).toBeVisible();

			const [ mainFeatureExampleElement ] = screen.getAllByTestId( 'feature-example-wrapper' );

			expect( mainFeatureExampleElement ).toBeVisible();

			verifyStringsAreWithinFeatureExample(
				stringsForAdvancedFeatureCards,
				mainFeatureExampleElement
			);

			stringsForBasicFeatureCards.forEach( ( string ) => {
				const elementForString = screen.getByText( string );

				expect( elementForString ).toBeVisible();
				expect( mainFeatureExampleElement ).not.toContainElement( elementForString );
			} );
		} );
	} );

	describe( 'Staging site', () => {
		it( 'should show the primary site card and not show the upsell nudge', () => {
			const testConfig = getTestConfig( {
				isAtomicSite: true,
				isWpcomStagingSite: true,
				planSlug: PLAN_BUSINESS_MONTHLY,
				siteFeatures: [ WPCOM_FEATURES_ATOMIC, FEATURE_SFTP, FEATURE_SITE_STAGING_SITES ],
				transferState: transferStates.COMPLETE,
			} );

			renderComponentWithStoreAndQueryClient( createTestStore( testConfig ) );

			expect(
				screen.queryByText( 'Upgrade to the Business plan to access all hosting features:' )
			).toBeNull();
			expect( screen.queryByText( 'Upgrade to Business Plan' ) ).toBeNull();

			expect( screen.getByTestId( 'staging-site-production-card' ) ).toBeVisible();
		} );
	} );
} );
