/**
 * @jest-environment node
 */
jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
} ) );

import { isTargetUrlValid } from '../utils';

describe( 'domain forwarding utils', () => {
	describe( 'isTargetUrlValid', () => {
		const sourceDomain = 'example.com';

		it( 'returns error when target URL is empty', () => {
			const error = isTargetUrlValid( '', sourceDomain );

			expect( error ).toBe( 'Please enter target URL.' );
		} );

		it( 'returns error when target URL equals the source domain root', () => {
			const error = isTargetUrlValid( 'https://example.com', sourceDomain );

			expect( error ).toBe( 'Forwarding to the same domain is not allowed.' );
		} );

		it( 'allows forwarding to the same domain when a path is provided', () => {
			const error = isTargetUrlValid( 'https://example.com/blog', sourceDomain );

			expect( error ).toBeNull();
		} );

		it( 'returns error when forwarding to a deeper subdomain', () => {
			const error = isTargetUrlValid( 'https://blog.example.com', sourceDomain );

			expect( error ).toBe( 'Forwarding to a further nested domain is not allowed.' );
		} );

		it( 'allows forwarding to a different domain', () => {
			const error = isTargetUrlValid( 'https://wordpress.com', sourceDomain );

			expect( error ).toBeNull();
		} );
	} );
	describe( 'isTargetUrlValid with subdomain', () => {
		const sourceDomain = 'blog.example.com';

		it( 'allows forwarding to the same domain when a path is provided', () => {
			const error = isTargetUrlValid( 'https://blog.example.com/blog', sourceDomain );

			expect( error ).toBeNull();
		} );

		it( 'returns error when forwarding to the same subdomain without a path', () => {
			const error = isTargetUrlValid( 'https://blog.example.com', sourceDomain );

			expect( error ).toBe( 'Forwarding to the same domain is not allowed.' );
		} );

		it( 'returns error when forwarding to a deeper subdomain', () => {
			const error = isTargetUrlValid( 'https://something.blog.example.com/', sourceDomain );

			expect( error ).toBe( 'Forwarding to a further nested domain is not allowed.' );
		} );

		it( 'allows forwarding to the same subdomain when a path is provided', () => {
			const error = isTargetUrlValid( 'https://blog.example.com/blog', sourceDomain );

			expect( error ).toBeNull();
		} );

		it( 'allows forwarding to a different domain', () => {
			const error = isTargetUrlValid( 'https://wordpress.com/blog', sourceDomain );

			expect( error ).toBeNull();
		} );
	} );
} );
