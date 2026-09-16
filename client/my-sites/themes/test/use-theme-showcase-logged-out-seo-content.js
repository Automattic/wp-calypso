/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import defaultCalypsoI18n, { I18NContext } from 'i18n-calypso';
import useThemeShowcaseLoggedOutSeoContent from '../use-theme-showcase-logged-out-seo-content';

jest.mock( '../hooks/use-is-theme-showcase-modern-enabled', () => ( {
	useIsThemeShowcaseModernEnabled: () => true,
} ) );

const mockHasEnTranslation = jest.fn( () => true );
jest.mock( '@automattic/i18n-utils', () => ( {
	...jest.requireActual( '@automattic/i18n-utils' ),
	useHasEnTranslation: () => mockHasEnTranslation,
} ) );

const NEW_TITLE = 'Free WordPress Themes — 1,000+ designs | WordPress.com';
const OLD_TITLE = 'WordPress Themes | 1000s of Options for All WordPress Sites';
const NEW_META_DESCRIPTION =
	'Browse thousands of free and premium WordPress themes. Filter by niche, preview instantly, and launch your site today — no coding required.';

describe( 'useThemeShowcaseLoggedOutSeoContent()', () => {
	const wrapper = ( { children } ) => (
		<I18NContext.Provider value={ defaultCalypsoI18n }>{ children }</I18NContext.Provider>
	);
	const render = ( filter, tier, vertical ) =>
		renderHook( () => useThemeShowcaseLoggedOutSeoContent( filter, tier, vertical ), { wrapper } )
			.result.current;

	beforeEach( () => {
		mockHasEnTranslation.mockReturnValue( true );
	} );

	test( 'uses the homepage title and meta description for the homepage', () => {
		const content = render( '', '' );

		expect( content.title ).toEqual( NEW_TITLE );
		expect( content.metaDescription ).toEqual( NEW_META_DESCRIPTION );
		expect( content.header ).toEqual( 'Beautiful themes for every idea' );
	} );

	test( 'treats the recommended category with the all tier as the homepage', () => {
		expect( render( 'recommended', 'all' ).title ).toEqual( NEW_TITLE );
	} );

	test( 'keeps the previous content when the homepage strings are untranslated', () => {
		mockHasEnTranslation.mockReturnValue( false );

		const content = render( '', '' );

		expect( content.title ).toEqual( OLD_TITLE );
		expect( content.metaDescription ).toBeUndefined();
	} );

	test( 'keeps the fallback content for filters without a dedicated entry', () => {
		const content = render( 'minimal', '' );

		expect( content.title ).toEqual( OLD_TITLE );
		expect( content.metaDescription ).toBeUndefined();
	} );

	test( 'keeps the fallback content for vertical pages', () => {
		const content = render( '', '', 'blog' );

		expect( content.title ).toEqual( OLD_TITLE );
		expect( content.metaDescription ).toBeUndefined();
	} );

	test( 'keeps the dedicated content for subject filters', () => {
		expect( render( 'subject:blog', '' ).title ).toEqual( 'Blog WordPress Themes' );
	} );

	test( 'keeps the dedicated content for tiers', () => {
		expect( render( '', 'free' ).title ).toEqual( 'Free WordPress Themes' );
	} );
} );
