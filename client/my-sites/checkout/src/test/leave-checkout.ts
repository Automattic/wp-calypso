/**
 * @jest-environment jsdom
 */

import { navigate } from 'calypso/lib/navigate';
import { leaveCheckout, isRelativeUrl } from '../lib/leave-checkout';

// Mock dependencies
jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( 'calypso/lib/navigate', () => ( {
	navigate: jest.fn(),
} ) );

describe( 'leaveCheckout', () => {
	beforeEach( () => {
		// Reset all mocks before each test
		jest.clearAllMocks();
		// Setup window.location
		Object.defineProperty( window, 'location', {
			value: {
				href: 'https://wordpress.com/checkout',
				origin: 'https://wordpress.com',
				search: '',
			},
			writable: true,
		} );
	} );

	describe( 'cancel_to parameter handling', () => {
		it( 'should navigate to cancel_to path when it is a relative URL', () => {
			window.location.search = '?cancel_to=/home';

			leaveCheckout( { tracksEvent: 'checkout_cancel' } );

			expect( navigate ).toHaveBeenCalledWith( '/home' );
		} );

		it( 'should not navigate to cancel_to path when it is an absolute URL', () => {
			window.location.search = '?cancel_to=https://example.com';

			leaveCheckout( { tracksEvent: 'checkout_cancel' } );

			expect( navigate ).not.toHaveBeenCalledWith( 'https://example.com' );
		} );

		it( 'should not navigate to cancel_to path when it is a protocol-relative URL', () => {
			window.location.search = '?cancel_to=//example.com';

			leaveCheckout( { tracksEvent: 'checkout_cancel' } );

			expect( navigate ).not.toHaveBeenCalledWith( '//example.com' );
		} );

		it( 'should not navigate to cancel_to path when it is trying to bypass relative path check', () => {
			window.location.search = '?cancel_to=/\\example.com';

			leaveCheckout( { tracksEvent: 'checkout_cancel' } );

			expect( navigate ).not.toHaveBeenCalledWith( '/\\example.com' );
		} );
	} );

	describe( 'getCloseURL handling', () => {
		it( 'returns to plans page when previous path is empty', () => {
			const siteSlug = 'mywpsite.wordpress.com';

			leaveCheckout( {
				siteSlug: siteSlug,
				tracksEvent: 'checkout_cancel',
				userHasClearedCart: true,
			} );

			expect( navigate ).toHaveBeenCalledWith( `/plans/${ siteSlug }` );
		} );

		it( 'returns to /start if missing site slug', () => {
			leaveCheckout( {
				tracksEvent: 'checkout_cancel',
				userHasClearedCart: true,
			} );

			expect( navigate ).toHaveBeenCalledWith( '/start' );
		} );

		it( 'returns to domain page when previous page is email upsell and cart is emptied', () => {
			const siteSlug = 'mywpsite.wordpress.com';

			leaveCheckout( {
				siteSlug: siteSlug,
				tracksEvent: 'checkout_cancel',
				previousPath: '/domains/add/my-search-domain/email/mywpsite.wordpress.com?',
				userHasClearedCart: true,
			} );

			expect( navigate ).toHaveBeenCalledWith( `/domains/add/${ siteSlug }` );
		} );

		it( 'returns to previousPath', () => {
			const previousPath = `/previous-path`;

			leaveCheckout( {
				tracksEvent: 'checkout_cancel',
				previousPath: previousPath,
				userHasClearedCart: false,
			} );

			expect( navigate ).toHaveBeenCalledWith( previousPath );
		} );

		it( 'returns to previousPath if email upsell and cart is not emptied', () => {
			const siteSlug = 'mywpsite.wordpress.com';
			const domain = 'my-search-domain';
			const previousPath = `/domains/add/${ domain }/email/${ siteSlug }?`;

			leaveCheckout( {
				siteSlug: siteSlug,
				tracksEvent: 'checkout_cancel',
				previousPath: previousPath,
				userHasClearedCart: false,
			} );

			expect( navigate ).toHaveBeenCalledWith( previousPath );
		} );
	} );
} );

describe( 'isRelativeUrl', () => {
	beforeEach( () => {
		Object.defineProperty( window, 'location', {
			value: {
				href: 'https://wordpress.com/checkout',
				origin: 'https://wordpress.com',
			},
			writable: true,
		} );
	} );

	describe( 'relative paths', () => {
		const testCases = [
			'/home',
			'/path/to/page',
			'path',
			'./path',
			'../path',
			'https://wordpress.com/path',
			'wordpress.com/path',
			'//wordpress.com/path',
			'/\\wordpress.com/path',
		];

		testCases.forEach( ( path ) => {
			it( `should return true for relative path: ${ path }`, () => {
				expect( isRelativeUrl( path ) ).toBe( true );
			} );
		} );
	} );

	describe( 'absolute URLs', () => {
		const testCases = [
			'http://example.com',
			'//example.com',
			'https://example.com/path',
			'/\\example.com',
		];

		testCases.forEach( ( url ) => {
			it( `should return false for absolute URL: ${ url }`, () => {
				expect( isRelativeUrl( url ) ).toBe( false );
			} );
		} );
	} );

	describe( 'invalid URLs', () => {
		const testCases = [
			'javascript:alert(1)',
			'data:text/html,<script>alert(1)</script>',
			'mailto:test@example.com',
		];

		testCases.forEach( ( url ) => {
			it( `should return false for invalid URL: ${ url }`, () => {
				expect( isRelativeUrl( url ) ).toBe( false );
			} );
		} );
	} );
} );
