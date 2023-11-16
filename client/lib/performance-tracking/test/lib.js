import { start, stop } from '@automattic/browser-data-collector';
import config from '@automattic/calypso-config';
import {
	getCurrentUserCountryCode,
	getCurrentUserSiteCount,
	getCurrentUserVisibleSiteCount,
	isCurrentUserBootstrapped,
	getCurrentUserLocale,
} from 'calypso/state/current-user/selectors';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { isJetpackSite, isSingleUserSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { collectTranslationTimings, clearTranslationTimings } from '../collectors/translations';
import { startPerformanceTracking, stopPerformanceTracking } from '../lib';

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
	getCurrentUserLocale: jest.fn(),
} ) );
jest.mock( 'calypso/state/selectors/is-site-wpcom-atomic', () => jest.fn() );
jest.mock( '../collectors/translations', () => ( {
	collectTranslationTimings: jest.fn(),
	clearTranslationTimings: jest.fn(),
} ) );

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
		collectTranslationTimings.mockImplementation( () => ( {} ) );
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
		getCurrentUserLocale.mockImplementation( () => 'es' );

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
		expect( report.data.get( 'userLocale' ) ).toBe( 'es' );
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

	it( 'uses state and metadata when invoking extra collectors', () => {
		const report = {
			data: new Map(),
		};

		const extraCollectors = [
			( state ) => {
				return ( rep ) => {
					rep.data.set( 'stateFoo', state.foo );
				};
			},
			( _, metadata ) => ( rep ) => {
				rep.data.set( 'metadataBar', metadata.bar );
			},
		];

		// Run the default collector
		stopPerformanceTracking( 'pageName', {
			state: {
				foo: 42,
			},
			metadata: {
				bar: 42,
			},
			extraCollectors,
		} );

		const extraCollector1 = stop.mock.calls[ 0 ][ 1 ].collectors[ 2 ];
		extraCollector1( report );
		const extraCollector2 = stop.mock.calls[ 0 ][ 1 ].collectors[ 3 ];
		extraCollector2( report );

		expect( report.data.get( 'stateFoo' ) ).toBe( 42 );
		expect( report.data.get( 'metadataBar' ) ).toBe( 42 );
	} );

	it( 'detects performance of translation chunks', () => {
		collectTranslationTimings.mockImplementation( () => ( {
			count: 1,
			total: 10,
		} ) );
		const report = {
			data: new Map(),
		};

		stopPerformanceTracking( 'pageName' );
		const defaultCollector = stop.mock.calls[ 0 ][ 1 ].collectors[ 0 ];
		defaultCollector( report );

		expect( report.data.get( 'translationsChunksDuration' ) ).toBe( 10 );
		expect( report.data.get( 'translationsChunksCount' ) ).toBe( 1 );
		expect( clearTranslationTimings ).toHaveBeenCalled();
	} );
} );
