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
