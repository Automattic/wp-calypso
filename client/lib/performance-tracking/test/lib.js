/**
 * External dependencies
 */
import { start, stop } from '@automattic/browser-data-collector';

/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import { startPerformanceTracking, stopPerformanceTracking } from '../lib';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { isJetpackSite, isSingleUserSite } from 'calypso/state/sites/selectors';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import {
	getCurrentUserCountryCode,
	getCurrentUserSiteCount,
	getCurrentUserVisibleSiteCount,
	isCurrentUserBootstrapped,
} from 'calypso/state/current-user/selectors';

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: jest.fn(),
} ) );
jest.mock( '@automattic/browser-data-collector', () => ( {
	start: jest.fn(),
	stop: jest.fn(),
} ) );
jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSiteId: jest.fn(),
} ) );
jest.mock( 'calypso/state/sites/selectors', () => ( {
	isJetpackSite: jest.fn(),
	isSingleUserSite: jest.fn(),
} ) );
jest.mock( 'calypso/state/current-user/selectors', () => ( {
	getCurrentUserCountryCode: jest.fn(),
	getCurrentUserSiteCount: jest.fn(),
	getCurrentUserVisibleSiteCount: jest.fn(),
	isCurrentUserBootstrapped: jest.fn(),
} ) );
jest.mock( 'calypso/state/selectors/is-site-wpcom-atomic', () => jest.fn() );

const withFeatureEnabled = () =>
	config.isEnabled.mockImplementation( ( key ) => key === 'rum-tracking/logstash' );
const withFeatureDisabled = () =>
	config.isEnabled.mockImplementation( ( key ) => key !== 'rum-tracking/logstash' );

describe( 'startPerformanceTracking', () => {
	beforeEach( () => {
		withFeatureEnabled();
	} );

	afterEach( () => {
		jest.resetAllMocks();
	} );

	it( 'starts measuring when the feature is enabled', () => {
		startPerformanceTracking( 'pageName' );

		expect( start ).toHaveBeenCalled();
	} );

	it( 'do not start measuring when the config flag is off', () => {
		withFeatureDisabled();

		startPerformanceTracking( 'pageName' );

		expect( start ).not.toHaveBeenCalled();
	} );

	it( 'uses the name of the page', () => {
		startPerformanceTracking( 'pageName' );

		expect( start ).toHaveBeenCalledWith( 'pageName', expect.anything() );
	} );

	it( 'measures fullPageLoad if the page is an initial navigation', () => {
		startPerformanceTracking( 'pageName', { fullPageLoad: true } );

		expect( start ).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining( { fullPageLoad: true } )
		);
	} );

	it( 'does not measure fullPageLoad if the page is not an initial navigation', () => {
		startPerformanceTracking( 'pageName', { fullPageLoad: false } );

		expect( start ).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining( { fullPageLoad: false } )
		);
	} );

	it( 'does not measure fullPageLoad by default', () => {
		startPerformanceTracking( 'pageName' );

		expect( start ).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining( { fullPageLoad: false } )
		);
	} );
} );

describe( 'stopPerformanceTracking', () => {
	beforeEach( () => {
		withFeatureEnabled();
	} );

	afterEach( () => {
		jest.resetAllMocks();
	} );

	it( 'stops measuring when the feature is enabled', () => {
		stopPerformanceTracking( 'pageName' );

		expect( stop ).toHaveBeenCalled();
	} );

	it( 'do not stop measuring when the config flag is off', () => {
		withFeatureDisabled();

		stopPerformanceTracking( 'pageName' );

		expect( stop ).not.toHaveBeenCalled();
	} );

	it( 'uses the name of the page', () => {
		stopPerformanceTracking( 'pageName' );

		expect( stop ).toHaveBeenCalledWith( 'pageName', expect.anything() );
	} );

	it( 'uses the state to generate the default collector', () => {
		const state = {};
		const report = {
			data: new Map(),
		};
		isJetpackSite.mockImplementation( () => false );
		isSingleUserSite.mockImplementation( () => false );
		isSiteWpcomAtomic.mockImplementation( () => false );
		getSelectedSiteId.mockImplementation( () => 42 );
		getCurrentUserSiteCount.mockImplementation( () => 2 );
		getCurrentUserVisibleSiteCount.mockImplementation( () => 1 );
		getCurrentUserCountryCode.mockImplementation( () => 'es' );
		isCurrentUserBootstrapped.mockImplementation( () => true );

		// Run the default collector
		stopPerformanceTracking( 'pageName', { state } );
		const defaultCollector = stop.mock.calls[ 0 ][ 1 ].collectors[ 0 ];
		defaultCollector( report );

		expect( isJetpackSite ).toHaveBeenCalledWith( state, 42 );
		expect( isSingleUserSite ).toHaveBeenCalledWith( state, 42 );
		expect( isSiteWpcomAtomic ).toHaveBeenCalledWith( state, 42 );
		expect( report.data.get( 'siteIsJetpack' ) ).toBe( false );
		expect( report.data.get( 'siteIsSingleUser' ) ).toBe( false );
		expect( report.data.get( 'siteIsAtomic' ) ).toBe( false );
		expect( report.data.get( 'sitesCount' ) ).toBe( 2 );
		expect( report.data.get( 'sitesVisibleCount' ) ).toBe( 1 );
		expect( report.data.get( 'userCountryCode' ) ).toBe( 'es' );
		expect( report.data.get( 'userBootstrapped' ) ).toBe( true );
	} );

	it( 'uses metdata to generate a collector', () => {
		const report = {
			data: new Map(),
		};

		// Run the default collector
		stopPerformanceTracking( 'pageName', {
			state: {},
			metadata: {
				foo: 42,
			},
		} );
		const metadataCollector = stop.mock.calls[ 0 ][ 1 ].collectors[ 1 ];
		metadataCollector( report );

		expect( report.data.get( 'foo' ) ).toBe( 42 );
	} );
} );
