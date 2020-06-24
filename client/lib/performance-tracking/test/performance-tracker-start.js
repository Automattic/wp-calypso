jest.mock( '../lib', () => ( {
	startPerformanceTracking: jest.fn(),
} ) );

/**
 * Internal dependencies
 */
import { performanceTrackerStart } from '../performance-tracker-start';
import { startPerformanceTracking } from '../lib';

describe( 'performance-tracker-start', () => {
	afterEach( () => {
		jest.resetAllMocks();
	} );

	it( 'generates a middleware', () => {
		const middleware = performanceTrackerStart( 'pageName' );
		const next = jest.fn();

		middleware( {}, next );

		expect( next ).toHaveBeenCalled();
	} );

	it( 'uses the name of the page', () => {
		performanceTrackerStart( 'pageName' )( {}, jest.fn() );

		expect( startPerformanceTracking ).toHaveBeenCalledWith( 'pageName', expect.anything() );
	} );

	it( 'measures fullPageLoad if the page is an initial navigation', () => {
		performanceTrackerStart( 'pageName' )( { init: true }, jest.fn() );

		expect( startPerformanceTracking ).toHaveBeenCalledWith( expect.anything(), {
			fullPageLoad: true,
		} );
	} );

	it( 'does not measure fullPageLoad if the page is not an initial navigation', () => {
		performanceTrackerStart( 'pageName' )( { init: false }, jest.fn() );

		expect( startPerformanceTracking ).toHaveBeenCalledWith( expect.anything(), {
			fullPageLoad: false,
		} );
	} );
} );
