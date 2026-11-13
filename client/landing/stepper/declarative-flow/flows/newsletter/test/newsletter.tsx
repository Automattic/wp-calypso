/**
 * @jest-environment jsdom
 */
import { waitFor } from '@testing-library/react';
import { resolveSelect } from '@wordpress/data';
import { STEPS } from '../../../internals/steps';
import { ProcessingResult } from '../../../internals/steps-repository/processing-step/constants';
import { runFlowNavigation } from '../../../test/helpers';
import newsletterFlow from '../newsletter';

// Spreading the real module drops its getters, which the data stores need when they register.
jest.mock( '@wordpress/data', () => {
	const actual = jest.requireActual( '@wordpress/data' );
	const resolveSelect = jest.fn();
	return new Proxy( actual, {
		get: ( target, key ) => ( key === 'resolveSelect' ? resolveSelect : target[ key ] ),
	} );
} );

const ADMIN_URL = 'https://example.wordpress.com/wp-admin/';
const SITE_SETUP_URL = `${ ADMIN_URL }admin.php?page=site-setup-wp-admin`;

const mockSite = ( options?: Record< string, unknown > ) =>
	( resolveSelect as jest.Mock ).mockReturnValue( {
		getSite: jest.fn().mockResolvedValue( options ? { options } : undefined ),
	} );

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
		it( 'sends an AI Launchpad site straight to Site Setup', async () => {
			mockSite( { admin_url: ADMIN_URL, wpcom_ai_launchpad_enabled: true } );

			runNavigation( {
				from: STEPS.PROCESSING,
				dependencies: {
					processingResult: ProcessingResult.SUCCESS,
					siteId: 123,
					siteSlug: 'example.wordpress.com',
				},
			} );

			await waitFor( () =>
				expect( window.location.assign ).toHaveBeenCalledWith( SITE_SETUP_URL )
			);
		} );

		it( 'sends a paid site to checkout, returning to Site Setup', async () => {
			mockSite( { admin_url: ADMIN_URL, wpcom_ai_launchpad_enabled: true } );

			runNavigation( {
				from: STEPS.PROCESSING,
				dependencies: {
					processingResult: ProcessingResult.SUCCESS,
					siteId: 123,
					siteSlug: 'example.wordpress.com',
					goToCheckout: true,
				},
			} );

			await waitFor( () =>
				expect( window.location.assign ).toHaveBeenCalledWith(
					`/checkout/example.wordpress.com?redirect_to=${ encodeURIComponent(
						SITE_SETUP_URL
					) }&signup=1`
				)
			);
		} );

		it( 'sends a site without the AI Launchpad to its home', async () => {
			mockSite( { admin_url: ADMIN_URL } );

			runNavigation( {
				from: STEPS.PROCESSING,
				dependencies: {
					processingResult: ProcessingResult.SUCCESS,
					siteId: 123,
					siteSlug: 'example.wordpress.com',
				},
			} );

			await waitFor( () =>
				expect( window.location.assign ).toHaveBeenCalledWith( '/home/example.wordpress.com' )
			);
		} );

		it( 'falls back to the home of the site ID when the site cannot be loaded', async () => {
			mockSite();

			runNavigation( {
				from: STEPS.PROCESSING,
				dependencies: { processingResult: ProcessingResult.SUCCESS, siteId: 123 },
			} );

			await waitFor( () => expect( window.location.assign ).toHaveBeenCalledWith( '/home/123' ) );
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
