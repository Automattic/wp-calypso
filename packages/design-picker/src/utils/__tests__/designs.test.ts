import { Design, DesignPreviewOptions } from '../../types';
import { DEFAULT_VIEWPORT_WIDTH, DEFAULT_VIEWPORT_HEIGHT } from '../constants';
import { getDesignPreviewUrl } from '../designs';

describe( 'Design Picker designs utils', () => {
	describe( 'getDesignPreviewUrl', () => {
		const design = {
			title: 'Zoologist',
			recipe: {
				stylesheet: 'pub/zoologist',
				pattern_ids: [ 12, 34 ],
			},
		} as Design;

		it( 'should return the block-previews/site endpoint with the correct query params', () => {
			expect( getDesignPreviewUrl( design, {} ) ).toEqual(
				`https://public-api.wordpress.com/wpcom/v2/block-previews/site?stylesheet=pub%2Fzoologist&pattern_ids=12%2C34&viewport_width=${ DEFAULT_VIEWPORT_WIDTH }&viewport_height=${ DEFAULT_VIEWPORT_HEIGHT }&source_site=patternboilerplates.wordpress.com&site_title=Zoologist`
			);
		} );

		it( 'should append the preview options to the query params', () => {
			const options: DesignPreviewOptions = {
				language: 'id',
				verticalId: '3',
				siteTitle: 'Design Title',
			};

			expect( getDesignPreviewUrl( design, options ) ).toEqual(
				`https://public-api.wordpress.com/wpcom/v2/block-previews/site?stylesheet=pub%2Fzoologist&pattern_ids=12%2C34&vertical_id=3&language=id&viewport_width=${ DEFAULT_VIEWPORT_WIDTH }&viewport_height=${ DEFAULT_VIEWPORT_HEIGHT }&source_site=patternboilerplates.wordpress.com&site_title=Design%20Title`
			);
		} );

		// Parentheses in uri components don't usually need to be escaped, but because the design url sometimes appears
		// in a `background-url: url( ... )` CSS rule the parentheses will break it.
		it( 'should escape parentheses within the site title', () => {
			const options: DesignPreviewOptions = {
				siteTitle: 'Mock(Design)(Title)',
			};

			expect( getDesignPreviewUrl( design, options ) ).toEqual(
				`https://public-api.wordpress.com/wpcom/v2/block-previews/site?stylesheet=pub%2Fzoologist&pattern_ids=12%2C34&viewport_width=${ DEFAULT_VIEWPORT_HEIGHT }&viewport_height=${ DEFAULT_VIEWPORT_HEIGHT }&source_site=patternboilerplates.wordpress.com&site_title=Mock%28Design%29%28Title%29`
			);
		} );
	} );
} );
