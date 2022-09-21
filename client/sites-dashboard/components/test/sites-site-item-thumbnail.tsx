/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { SiteItemThumbnail } from '../sites-site-item-thumbnail';

function makeTestSite( { title = 'test' } = {} ) {
	return {
		ID: 1,
		title,
		slug: '',
		URL: '',
		launch_status: 'launched',
		options: {},
		jetpack: false,
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
		render( <SiteItemThumbnail site={ makeTestSite( { title: 'hello' } ) } /> );
		expect( screen.getByLabelText( 'Site Icon' ) ).toHaveTextContent( /^h$/ );
	} );

	test( 'diacritic mark on first letter', () => {
		render( <SiteItemThumbnail site={ makeTestSite( { title: 'öwl' } ) } /> );
		expect( screen.getByLabelText( 'Site Icon' ) ).toHaveTextContent( /^ö$/ );
	} );

	test( 'empty site title renders no initial', () => {
		render( <SiteItemThumbnail site={ makeTestSite( { title: '' } ) } /> );
		expect( screen.getByLabelText( 'Site Icon' ) ).toBeEmptyDOMElement();
	} );

	test( 'undefined site title renders no initial', () => {
		const testSite = makeTestSite();
		// @ts-expect-error Let's artificially remove the title so it tries to render an empty string
		testSite.title = undefined;

		render( <SiteItemThumbnail site={ testSite } /> );
		expect( screen.getByLabelText( 'Site Icon' ) ).toBeEmptyDOMElement();
	} );
}
