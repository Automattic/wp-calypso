/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { SiteItemThumbnail } from '../sites-site-item-thumbnail';

function makeTestSite( { name = 'test' } = {} ) {
	return {
		ID: 1,
		name: name as string | undefined,
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

			test( 'site name can be multi-codepoint emoji', () => {
				render(
					<SiteItemThumbnail
						site={ makeTestSite( { name: '👩‍👩‍👦‍👦 family: woman, woman, boy, boy' } ) }
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
						site={ makeTestSite( { name: '👩‍👩‍👦‍👦 family: woman, woman, boy, boy' } ) }
					/>
				);
				expect( screen.getByLabelText( 'Site Icon' ) ).toHaveTextContent( /^👩$/ );
			} );
		} );
	} );
} );

function defineCommonSiteInitialTests() {
	test( 'an English site name', () => {
		render( <SiteItemThumbnail site={ makeTestSite( { name: 'hello' } ) } /> );
		expect( screen.getByLabelText( 'Site Icon' ) ).toHaveTextContent( /^h$/ );
	} );

	test( 'diacritic mark on first letter', () => {
		render( <SiteItemThumbnail site={ makeTestSite( { name: 'öwl' } ) } /> );
		expect( screen.getByLabelText( 'Site Icon' ) ).toHaveTextContent( /^ö$/ );
	} );

	test( 'empty site name renders no initial', () => {
		render( <SiteItemThumbnail site={ makeTestSite( { name: '' } ) } /> );
		expect( screen.getByLabelText( 'Site Icon' ) ).toBeEmptyDOMElement();
	} );

	test( 'undefined site name renders no initial', () => {
		const testSite = makeTestSite();
		testSite.name = undefined;

		render( <SiteItemThumbnail site={ testSite } /> );
		expect( screen.getByLabelText( 'Site Icon' ) ).toBeEmptyDOMElement();
	} );
}
