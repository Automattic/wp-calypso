/**
 * @jest-environment node
 */
import page from '@automattic/calypso-router';
import { getCanonicalThemeSlugPath, redirectToLowerCaseThemeSlug } from '../controller';

jest.mock( '@automattic/calypso-router', () => ( {
	redirect: jest.fn(),
} ) );

describe( 'getCanonicalThemeSlugPath', () => {
	test( 'lowercases a capitalized theme slug', () => {
		expect( getCanonicalThemeSlugPath( '/theme/Russell' ) ).toBe( '/theme/russell' );
	} );

	test( 'leaves an already-lowercase slug unchanged', () => {
		expect( getCanonicalThemeSlugPath( '/theme/russell' ) ).toBe( '/theme/russell' );
	} );

	test( 'lowercases only the slug, preserving the section segment', () => {
		expect( getCanonicalThemeSlugPath( '/theme/Russell/setup' ) ).toBe( '/theme/russell/setup' );
	} );

	test( 'preserves a trailing site segment without lowercasing it', () => {
		expect( getCanonicalThemeSlugPath( '/theme/Russell/Example.WordPress.com' ) ).toBe(
			'/theme/russell/Example.WordPress.com'
		);
	} );

	test( 'preserves a leading locale segment', () => {
		expect( getCanonicalThemeSlugPath( '/de/theme/Russell' ) ).toBe( '/de/theme/russell' );
	} );

	test( 'lowercases the slug but preserves the query string casing', () => {
		expect( getCanonicalThemeSlugPath( '/theme/Russell?style_variation=Blue' ) ).toBe(
			'/theme/russell?style_variation=Blue'
		);
	} );
} );

describe( 'redirectToLowerCaseThemeSlug', () => {
	beforeEach( () => {
		page.redirect.mockClear();
	} );

	test( 'client-side: redirects a capitalized slug to its lowercase canonical path', () => {
		const context = { path: '/theme/Russell', isServerSide: false };
		const next = jest.fn();

		redirectToLowerCaseThemeSlug( context, next );

		expect( page.redirect ).toHaveBeenCalledWith( '/theme/russell' );
		expect( next ).not.toHaveBeenCalled();
	} );

	test( 'server-side: redirects via the response object', () => {
		const redirect = jest.fn();
		const context = { path: '/theme/Russell', isServerSide: true, res: { redirect } };
		const next = jest.fn();

		redirectToLowerCaseThemeSlug( context, next );

		expect( redirect ).toHaveBeenCalledWith( '/theme/russell' );
		expect( page.redirect ).not.toHaveBeenCalled();
		expect( next ).not.toHaveBeenCalled();
	} );

	test( 'calls next without redirecting when the slug is already lowercase', () => {
		const context = { path: '/theme/russell', isServerSide: false };
		const next = jest.fn();

		redirectToLowerCaseThemeSlug( context, next );

		expect( page.redirect ).not.toHaveBeenCalled();
		expect( next ).toHaveBeenCalledTimes( 1 );
	} );
} );
