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
		startPerformanceTracking( 'pageName', true );

		expect( start ).toHaveBeenCalledWith( expect.anything(), { fullPageLoad: true } );
	} );

	it( 'does not measure fullPageLoad if the page is not an initial navigation', () => {
		startPerformanceTracking( 'pageName', false );

		expect( start ).toHaveBeenCalledWith( expect.anything(), { fullPageLoad: false } );
	} );

	it( 'does not measure fullPageLoad by default', () => {
		startPerformanceTracking( 'pageName' );

		expect( start ).toHaveBeenCalledWith( expect.anything(), { fullPageLoad: false } );
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

		expect( stop ).toHaveBeenCalledWith( 'pageName' );
	} );
} );
