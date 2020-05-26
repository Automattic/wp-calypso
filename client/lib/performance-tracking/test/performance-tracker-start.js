/**
 * External dependencies
 */
import { start } from '@automattic/browser-data-collector';

/**
 * Internal dependencies
 */
import config from 'config';
import { performanceTrackerStart } from '../performance-tracker-start';

jest.mock( 'config', () => ( {
	isEnabled: jest.fn(),
} ) );
jest.mock( '@automattic/browser-data-collector', () => ( {
	start: jest.fn(),
} ) );

const withFeatureEnabled = () =>
	config.isEnabled.mockImplementation( ( key ) => key === 'rum-tracking/logstash' );
const withFeatureDisabled = () =>
	config.isEnabled.mockImplementation( ( key ) => key !== 'rum-tracking/logstash' );

describe( 'performance-tracker-start', () => {
	beforeEach( () => {
		withFeatureEnabled();
	} );

	afterEach( () => {
		jest.resetAllMocks();
	} );

	it( 'generates a middleware', () => {
		const middleware = performanceTrackerStart( 'pageName' );
		const next = jest.fn();

		middleware( {}, next );

		expect( next ).toHaveBeenCalled();
	} );

	it( 'starts measuring when the feature is enabled', () => {
		performanceTrackerStart( 'pageName' )( {}, jest.fn() );

		expect( start ).toHaveBeenCalled();
	} );

	it( 'do not start measuring when the config flag is off', () => {
		withFeatureDisabled();

		performanceTrackerStart( 'pageName' )( {}, jest.fn() );

		expect( start ).not.toHaveBeenCalled();
	} );

	it( 'uses the name of the page', () => {
		performanceTrackerStart( 'pageName' )( {}, jest.fn() );

		expect( start ).toHaveBeenCalledWith( 'pageName', expect.anything() );
	} );

	it( 'if the page name is not provided, uses "calypso" as the name', () => {
		performanceTrackerStart()( {}, jest.fn() );

		expect( start ).toHaveBeenCalledWith( 'calypso', expect.anything() );
	} );

	it( 'measures fullPageLoad if the page is an initial navigation', () => {
		performanceTrackerStart( 'pageName' )( { init: true }, jest.fn() );

		expect( start ).toHaveBeenCalledWith( expect.anything(), { fullPageLoad: true } );
	} );

	it( 'does not measure fullPageLoad if the page is not an initial navigation', () => {
		performanceTrackerStart( 'pageName' )( { init: false }, jest.fn() );

		expect( start ).toHaveBeenCalledWith( expect.anything(), { fullPageLoad: false } );
	} );

	it( 'does not measure fullPageLoad by default', () => {
		performanceTrackerStart( 'pageName' )( {}, jest.fn() );

		expect( start ).toHaveBeenCalledWith( expect.anything(), { fullPageLoad: false } );
	} );
} );
