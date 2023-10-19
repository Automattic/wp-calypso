import { DEFAULT_VIEWPORT_HEIGHT } from '../../constants';
import { Design, DesignPreviewOptions } from '../../types';
import { getDesignPreviewUrl } from '../designs';

const mergeDesign = ( currentDesign, newDesign ) => ( {
	...currentDesign,
	...newDesign,
	recipe: {
		...currentDesign.recipe,
		...newDesign.recipe,
	},
} );

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
				`https://public-api.wordpress.com/wpcom/v2/block-previews/site?stylesheet=pub%2Fzoologist&pattern_ids=12%2C34&viewport_height=${ DEFAULT_VIEWPORT_HEIGHT }&site_title=Zoologist`
			);
		} );

		it( 'should append the header_pattern_ids to the query params', () => {
			const customizedDesign = mergeDesign( design, {
				recipe: { header_pattern_ids: [ 56, 78 ] },
			} );

			expect( getDesignPreviewUrl( customizedDesign, {} ) ).toEqual(
				`https://public-api.wordpress.com/wpcom/v2/block-previews/site?stylesheet=pub%2Fzoologist&pattern_ids=12%2C34&header_pattern_ids=56%2C78&viewport_height=${ DEFAULT_VIEWPORT_HEIGHT }&site_title=Zoologist`
			);
		} );

		it( 'should append the footer_pattern_ids to the query params', () => {
			const customizedDesign = mergeDesign( design, {
				recipe: { footer_pattern_ids: [ 56, 78 ] },
			} );

			expect( getDesignPreviewUrl( customizedDesign, {} ) ).toEqual(
				`https://public-api.wordpress.com/wpcom/v2/block-previews/site?stylesheet=pub%2Fzoologist&pattern_ids=12%2C34&footer_pattern_ids=56%2C78&viewport_height=${ DEFAULT_VIEWPORT_HEIGHT }&site_title=Zoologist`
			);
		} );

		it( 'should append the preview options to the query params', () => {
			const options: DesignPreviewOptions = {
				language: 'id',
				site_title: 'Design Title',
				viewport_height: 700,
			};

			expect( getDesignPreviewUrl( design, options ) ).toEqual(
				`https://public-api.wordpress.com/wpcom/v2/block-previews/site?stylesheet=pub%2Fzoologist&pattern_ids=12%2C34&language=id&viewport_height=700&site_title=Design%20Title`
			);
		} );

		// Parentheses in uri components don't usually need to be escaped, but because the design url sometimes appears
		// in a `background-url: url( ... )` CSS rule the parentheses will break it.
		it( 'should escape parentheses within the site title', () => {
			const options: DesignPreviewOptions = {
				site_title: 'Mock(Design)(Title)',
			};

			expect( getDesignPreviewUrl( design, options ) ).toEqual(
				`https://public-api.wordpress.com/wpcom/v2/block-previews/site?stylesheet=pub%2Fzoologist&pattern_ids=12%2C34&viewport_height=${ DEFAULT_VIEWPORT_HEIGHT }&site_title=Mock%28Design%29%28Title%29`
			);
		} );
	} );
} );
