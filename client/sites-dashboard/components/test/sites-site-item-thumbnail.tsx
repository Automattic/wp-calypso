/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { render, screen } from '@testing-library/react';
import { SiteItemThumbnail } from '../sites-site-item-thumbnail';

function makeTestSite( { title = 'test', is_coming_soon = false, lang = 'en' } = {} ) {
	return {
		ID: 1,
		title,
		slug: '',
		URL: '',
		launch_status: 'launched',
		options: {},
		jetpack: false,
		is_coming_soon,
		lang,
	};
}

describe( '<SiteItemThumbnail>', () => {
	describe( 'Fallback site icon', () => {
		describe( 'Intl.Segmenter API is available', () => {
			test( 'confirm Intl available', () => {
				expect( Intl.Segmenter ).toBeDefined();
			} );

			defineCommonSiteInitialTests();

			test( 'site title can be multi-codepoint emoji', () => {
				render(
					<SiteItemThumbnail
						displayMode="tile"
						site={ makeTestSite( { title: '👩‍👩‍👦‍👦 family: woman, woman, boy, boy' } ) }
					/>
				);
				expect( screen.getByLabelText( 'Site Icon' ) ).toHaveTextContent( /^👩‍👩‍👦‍👦$/ );
			} );
		} );

		describe( 'Intl.Segmenter API is not available', () => {
			let rememberSegmenter;
			beforeAll( () => {
				rememberSegmenter = Intl.Segmenter;
				delete Intl.Segmenter;
			} );

			afterAll( () => {
				Intl.Segmenter = rememberSegmenter;
			} );

			defineCommonSiteInitialTests();

			test( 'site name can be multi-codepoint emoji', () => {
				// Without the Segmenter API we fall back to returning the first codepoint
				render(
					<SiteItemThumbnail
						displayMode="tile"
						site={ makeTestSite( { title: '👩‍👩‍👦‍👦 family: woman, woman, boy, boy' } ) }
					/>
				);
				expect( screen.getByLabelText( 'Site Icon' ) ).toHaveTextContent( /^👩$/ );
			} );
		} );
	} );
} );

function defineCommonSiteInitialTests() {
	test( 'an English site title', () => {
		render( <SiteItemThumbnail displayMode="tile" site={ makeTestSite( { title: 'hello' } ) } /> );
		expect( screen.getByLabelText( 'Site Icon' ) ).toHaveTextContent( /^h$/ );
	} );

	test( 'diacritic mark on first letter', () => {
		render( <SiteItemThumbnail displayMode="tile" site={ makeTestSite( { title: 'öwl' } ) } /> );
		expect( screen.getByLabelText( 'Site Icon' ) ).toHaveTextContent( /^ö$/ );
	} );

	test( 'empty site title renders no initial', () => {
		render( <SiteItemThumbnail displayMode="tile" site={ makeTestSite( { title: '' } ) } /> );
		expect( screen.getByLabelText( 'Site Icon' ) ).toBeEmptyDOMElement();
	} );

	test( 'undefined site title renders no initial', () => {
		const testSite = makeTestSite();
		// @ts-expect-error Let's artificially remove the title so it tries to render an empty string
		testSite.title = undefined;

		render( <SiteItemThumbnail displayMode="tile" site={ testSite } /> );
		expect( screen.getByLabelText( 'Site Icon' ) ).toBeEmptyDOMElement();
	} );

	test( 'shows "Coming soon" tile if site has not launched', () => {
		render( <SiteItemThumbnail site={ makeTestSite( { title: '', is_coming_soon: true } ) } /> );
		expect( screen.getByTitle( 'Coming Soon' ) ).toBeInTheDocument();
	} );

	test( 'shows "Coming soon" translated to site language', () => {
		render(
			<SiteItemThumbnail
				site={ makeTestSite( { title: '', is_coming_soon: true, lang: 'de-DE' } ) }
			/>
		);
		expect( screen.getByTitle( 'Demnächst verfügbar' ) ).toBeInTheDocument();
	} );

	test( 'shows "Coming soon" in English when site language is not translated', () => {
		render(
			<SiteItemThumbnail site={ makeTestSite( { title: '', is_coming_soon: true, lang: 'zz' } ) } />
		);
		expect( screen.getByTitle( 'Coming Soon' ) ).toBeInTheDocument();
	} );
}
