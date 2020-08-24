/**
 * External dependencies
 */
import { start, stop } from '@automattic/browser-data-collector';

/**
 * Internal dependencies
 */
import config from 'config';
import { startPerformanceTracking, stopPerformanceTracking } from '../lib';
import { abtest } from 'lib/abtest';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite, isSingleUserSite } from 'state/sites/selectors';
import isSiteWpcomAtomic from 'state/selectors/is-site-wpcom-atomic';

jest.mock( 'config', () => ( {
	isEnabled: jest.fn(),
} ) );
jest.mock( '@automattic/browser-data-collector', () => ( {
	start: jest.fn(),
	stop: jest.fn(),
} ) );
jest.mock( 'lib/abtest', () => ( {
	abtest: jest.fn(),
} ) );
jest.mock( 'state/ui/selectors', () => ( {
	getSelectedSiteId: jest.fn(),
} ) );
jest.mock( 'state/sites/selectors', () => ( {
	isJetpackSite: jest.fn(),
	isSingleUserSite: jest.fn(),
} ) );
jest.mock( 'state/selectors/is-site-wpcom-atomic', () => jest.fn() );

const withFeatureEnabled = () =>
	config.isEnabled.mockImplementation( ( key ) => key === 'rum-tracking/logstash' );
const withFeatureDisabled = () =>
	config.isEnabled.mockImplementation( ( key ) => key !== 'rum-tracking/logstash' );
const withABTestEnabled = () =>
	abtest.mockImplementation( ( test ) =>
		test === 'rumDataCollection' ? 'collectData' : 'noData'
	);
const withABTestDisabled = () => abtest.mockImplementation( () => 'noData' );

describe( 'startPerformanceTracking', () => {
	beforeEach( () => {
		withFeatureEnabled();
		withABTestEnabled();
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

	it( 'do not start measuring when the abtest is disabled', () => {
		withABTestDisabled();

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
		withABTestEnabled();
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

	it( 'do not stop measuring when the abtest is disabled', () => {
		withABTestDisabled();

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
