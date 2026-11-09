/**
 * @jest-environment jsdom
 */
import { STEPS } from '../../../internals/steps';
import { ProcessingResult } from '../../../internals/steps-repository/processing-step/constants';
import { runFlowNavigation } from '../../../test/helpers';
import newsletterFlow from '../newsletter';

const runNavigation = ( options: Parameters< typeof runFlowNavigation >[ 1 ] ) =>
	runFlowNavigation( newsletterFlow, options, 'forward' );

describe( 'Newsletter Flow', () => {
	const originalLocation = window.location;

	beforeAll( () => {
		Object.defineProperty( window, 'location', {
			value: {
				...originalLocation,
				assign: jest.fn(),
				replace: jest.fn(),
				href: 'https://wordpress.com/setup/newsletter',
			},
			writable: true,
			configurable: true,
		} );
	} );

	afterAll( () => {
		Object.defineProperty( window, 'location', {
			value: originalLocation,
			writable: true,
			configurable: true,
		} );
	} );

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'after creating the site', () => {
		it( 'sends a free site to its home, which forwards to Site Setup', () => {
			runNavigation( {
				from: STEPS.PROCESSING,
				dependencies: {
					processingResult: ProcessingResult.SUCCESS,
					siteId: 123,
					siteSlug: 'example.wordpress.com',
				},
			} );

			expect( window.location.assign ).toHaveBeenCalledWith( '/home/example.wordpress.com' );
		} );

		it( 'sends a paid site to checkout, returning to its home', () => {
			runNavigation( {
				from: STEPS.PROCESSING,
				dependencies: {
					processingResult: ProcessingResult.SUCCESS,
					siteId: 123,
					siteSlug: 'example.wordpress.com',
					goToCheckout: true,
				},
			} );

			expect( window.location.assign ).toHaveBeenCalledWith(
				'/checkout/example.wordpress.com?redirect_to=%2Fhome%2Fexample.wordpress.com&signup=1'
			);
		} );

		it( 'falls back to the site ID without a site slug', () => {
			runNavigation( {
				from: STEPS.PROCESSING,
				dependencies: { processingResult: ProcessingResult.SUCCESS, siteId: 123 },
			} );

			expect( window.location.assign ).toHaveBeenCalledWith( '/home/123' );
		} );

		it.each( [
			[ 'site creation failed', { processingResult: ProcessingResult.FAILURE } ],
			[ 'there was nothing to process', { processingResult: ProcessingResult.NO_ACTION } ],
			[ 'no site came back', { processingResult: ProcessingResult.SUCCESS } ],
		] )( 'shows the error step when %s', ( _, dependencies ) => {
			const destination = runNavigation( { from: STEPS.PROCESSING, dependencies } );

			expect( destination ).toMatchDestination( { step: STEPS.ERROR, query: null } );
			expect( window.location.assign ).not.toHaveBeenCalled();
		} );
	} );
} );
