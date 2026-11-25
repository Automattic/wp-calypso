import { vi } from 'vitest';
import { startPerformanceTracking } from '../lib';
import { performanceTrackerStart } from '../performance-tracker-start';

vi.mock( '../lib', () => ( {
	startPerformanceTracking: vi.fn(),
} ) );

describe( 'performance-tracker-start', () => {
	afterEach( () => {
		vi.resetAllMocks();
	} );

	it( 'generates a middleware', () => {
		const middleware = performanceTrackerStart( 'pageName' );
		const next = vi.fn();

		middleware( {}, next );

		expect( next ).toHaveBeenCalled();
	} );

	it( 'uses the name of the page', () => {
		performanceTrackerStart( 'pageName' )( {}, vi.fn() );

		expect( startPerformanceTracking ).toHaveBeenCalledWith( 'pageName', expect.anything() );
	} );

	it( 'measures fullPageLoad if the page is an initial navigation', () => {
		performanceTrackerStart( 'pageName' )( { init: true }, vi.fn() );

		expect( startPerformanceTracking ).toHaveBeenCalledWith( expect.anything(), {
			fullPageLoad: true,
		} );
	} );

	it( 'does not measure fullPageLoad if the page is not an initial navigation', () => {
		performanceTrackerStart( 'pageName' )( { init: false }, vi.fn() );

		expect( startPerformanceTracking ).toHaveBeenCalledWith( expect.anything(), {
			fullPageLoad: false,
		} );
	} );
} );
