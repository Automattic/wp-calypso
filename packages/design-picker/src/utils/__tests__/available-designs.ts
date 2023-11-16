import '@automattic/calypso-config';
import { shuffle } from '@automattic/js-utils';
import '../../constants';
import {
	getDesignUrl,
	getAvailableDesigns,
	includeFseDesigns,
	excludeFseDesigns,
} from '../available-designs';
import { availableDesignsConfig } from '../available-designs-config';
import type { Design } from '../../types';

jest.mock( '@automattic/calypso-config', () => ( {
	// Useful because the getAvailableDesigns function uses feature flags for
	// arguments default values
	isEnabled: () => false,
} ) );

jest.mock( '@automattic/js-utils', () => ( {
	// Mock the shuffle function to ensure test repeatability.
	// The function itself is unit-tested separately
	shuffle: jest.fn( ( array ) => array ),
} ) );

jest.mock( '../available-designs-config', () => {
	const mockDesign: Design = {
		title: 'Mock',
		slug: 'mock-design-slug',
		template: 'mock-design-template',
		theme: 'mock-design-theme',
		stylesheet: 'pub/mock-design-theme',
		fonts: {
			headings: 'Arvo',
			base: 'Cabin',
		},
		categories: [ { slug: 'featured', name: 'Featured' } ],
		is_premium: false,
		features: [],
	};

	const mockDesignWithoutFonts: Design = {
		title: 'Mock',
		slug: 'mock-design-slug',
		template: 'mock-design-template',
		theme: 'mock-design-theme',
		stylesheet: 'pub/mock-design-theme',
		categories: [ { slug: 'featured', name: 'Featured' } ],
		is_premium: false,
		features: [],
	};

	const mockDesignPremium: Design = {
		title: 'Mock',
		slug: 'mock-premium-design-slug',
		template: 'mock-premium-design-template',
		theme: 'mock-premium-design-theme',
		stylesheet: 'premium/mock-premium-design-theme',
		fonts: {
			headings: 'Arvo',
			base: 'Cabin',
		},
		categories: [ { slug: 'featured', name: 'Featured' } ],
		is_premium: true,
		features: [],
	};

	const mockDesignFse: Design = {
		title: 'Mock',
		slug: 'mock-design-slug',
		template: 'mock-design-template',
		theme: 'mock-design-theme',
		stylesheet: 'pub/mock-design-theme',
		fonts: {
			headings: 'Arvo',
			base: 'Cabin',
		},
		categories: [ { slug: 'featured', name: 'Featured' } ],
		is_premium: false,
		is_fse: true,
		features: [],
	};

	const mockDesignAlpha: Design = {
		title: 'Mock',
		slug: 'mock-design-alpha-slug',
		template: 'mock-design-alpha-template',
		theme: 'mock-design-alpha-theme',
		stylesheet: 'pub/mock-design-alpha-theme',
		fonts: {
			headings: 'Arvo',
			base: 'Cabin',
		},
		categories: [ { slug: 'featured', name: 'Featured' } ],
		is_premium: false,
		is_alpha: true,
		features: [],
	};

	const mockDesignBlankCanvas: Design = {
		title: 'Mock',
		slug: 'mock-blank-canvas-design-slug',
		template: 'mock-blank-canvas-design-template',
		theme: 'mock-blank-canvas-design-theme',
		stylesheet: 'pub/mock-blank-canvas-design-theme',
		categories: [ { slug: 'featured', name: 'Featured' } ],
		is_premium: false,
		is_featured_picks: true,
		features: [],
	};

	const mockDesignMissingStylesheet: Design = {
		title: 'Mock',
		slug: 'mock-design-slug',
		template: 'mock-design-template',
		theme: 'mock-design-theme',
		categories: [ { slug: 'featured', name: 'Featured' } ],
		is_premium: false,
		features: [],
	};

	return {
		availableDesignsConfig: {
			featured: [
				mockDesign,
				mockDesignWithoutFonts,
				mockDesignPremium,
				mockDesignFse,
				mockDesignAlpha,
				mockDesignBlankCanvas,
				mockDesignMissingStylesheet,
			],
		},
	};
} );

const mockLocale = 'mock-locale';

describe( 'Design Picker design utils', () => {
	describe( 'getDesignUrl', () => {
		it( 'should compose the correct design API URL', () => {
			const mockDesign = availableDesignsConfig.featured[ 0 ];

			expect( getDesignUrl( mockDesign, mockLocale ) ).toEqual(
				`https://public-api.wordpress.com/rest/v1.1/template/demo/${ mockDesign.stylesheet }/${ mockDesign.template }?font_headings=${ mockDesign.fonts.headings }&font_base=${ mockDesign.fonts.base }&viewport_height=700&language=${ mockLocale }&use_screenshot_overrides=true&site_title=${ mockDesign.title }`
			);
		} );

		it( 'should compose the correct design API URL when a design has no fonts specified', () => {
			const mockDesignWithoutFonts = availableDesignsConfig.featured[ 1 ];

			expect( getDesignUrl( mockDesignWithoutFonts, mockLocale ) ).toEqual(
				`https://public-api.wordpress.com/rest/v1.1/template/demo/${ mockDesignWithoutFonts.stylesheet }/${ mockDesignWithoutFonts.template }?viewport_height=700&language=${ mockLocale }&use_screenshot_overrides=true&site_title=${ mockDesignWithoutFonts.title }`
			);
		} );

		// This test is for legacy code. The theme repo wasn't part of the endpoint URL in v1 of the API.
		it( 'assumes the theme is in the public repo when the design config is missing the stylesheet property', () => {
			const mockDesignMissingStylesheet = availableDesignsConfig.featured[ 6 ];

			expect( getDesignUrl( mockDesignMissingStylesheet, mockLocale ) ).toEqual(
				`https://public-api.wordpress.com/rest/v1.1/template/demo/pub/${ mockDesignMissingStylesheet.theme }/${ mockDesignMissingStylesheet.template }?viewport_height=700&language=${ mockLocale }&use_screenshot_overrides=true&site_title=${ mockDesignMissingStylesheet.title }`
			);
		} );

		// Parentheses in uri components don't usually need to be escaped, but because the design url sometimes appears
		// in a `background-url: url( ... )` CSS rule the parentheses will break it.
		it( 'escapes parentheses within the site title', () => {
			const mockDesign = availableDesignsConfig.featured[ 0 ];
			mockDesign.title = 'Mock(Design)(Title)';

			expect( getDesignUrl( mockDesign, mockLocale ) ).toEqual(
				`https://public-api.wordpress.com/rest/v1.1/template/demo/${ mockDesign.stylesheet }/${ mockDesign.template }?font_headings=${ mockDesign.fonts.headings }&font_base=${ mockDesign.fonts.base }&viewport_height=700&language=${ mockLocale }&use_screenshot_overrides=true&site_title=Mock%28Design%29%28Title%29`
			);
		} );
	} );

	describe( 'getAvailableDesigns', () => {
		it( 'should get only FSE designs (both alpha and non alpha)', () => {
			const mockDesignFSE = availableDesignsConfig.featured[ 3 ];
			expect(
				getAvailableDesigns( {
					includeAlphaDesigns: true,
					featuredDesignsFilter: includeFseDesigns,
				} )
			).toEqual( {
				featured: [ mockDesignFSE ],
			} );
		} );

		it( 'should include alpha designs and exclude FSE designs', () => {
			const mockDesign = availableDesignsConfig.featured[ 0 ];
			const mockDesignWithoutFonts = availableDesignsConfig.featured[ 1 ];
			const mockDesignPremium = availableDesignsConfig.featured[ 2 ];
			const mockDesignAlpha = availableDesignsConfig.featured[ 4 ];
			const mockDesignBlankCanvas = availableDesignsConfig.featured[ 5 ];
			const mockDesignMissingStylesheet = availableDesignsConfig.featured[ 6 ];
			expect(
				getAvailableDesigns( {
					includeAlphaDesigns: true,
					featuredDesignsFilter: excludeFseDesigns,
				} )
			).toEqual( {
				featured: [
					// Blank canvas is always in first position
					mockDesignBlankCanvas,
					mockDesign,
					mockDesignWithoutFonts,
					mockDesignPremium,
					mockDesignAlpha,
					mockDesignMissingStylesheet,
				],
			} );
		} );

		it( 'should get only FSE, non-alpha designs', () => {
			const mockDesignFSE = availableDesignsConfig.featured[ 3 ];
			expect(
				getAvailableDesigns( {
					includeAlphaDesigns: false,
					featuredDesignsFilter: includeFseDesigns,
				} )
			).toEqual( {
				featured: [ mockDesignFSE ],
			} );
		} );

		it( 'should get all non-alpha, non-FSE designs', () => {
			const mockDesign = availableDesignsConfig.featured[ 0 ];
			const mockDesignWithoutFonts = availableDesignsConfig.featured[ 1 ];
			const mockDesignPremium = availableDesignsConfig.featured[ 2 ];
			const mockDesignBlankCanvas = availableDesignsConfig.featured[ 5 ];
			const mockDesignMissingStylesheet = availableDesignsConfig.featured[ 6 ];
			expect(
				getAvailableDesigns( {
					includeAlphaDesigns: false,
					featuredDesignsFilter: excludeFseDesigns,
				} )
			).toEqual( {
				featured: [
					// Blank canvas is always in first position
					mockDesignBlankCanvas,
					mockDesign,
					mockDesignWithoutFonts,
					mockDesignPremium,
					mockDesignMissingStylesheet,
				],
			} );
		} );

		it( 'should randomize the results order when the randomize flag is specified', () => {
			// Since `shuffle` is already unit-tested, we just need to check
			// that it's only called when the `randomize` flag is specified.
			const designs = getAvailableDesigns( { randomize: false } ).featured;
			expect( shuffle ).not.toHaveBeenCalled();

			getAvailableDesigns( { randomize: true } ).featured;

			expect( shuffle ).toHaveBeenCalledTimes( 1 );
			expect( shuffle ).toHaveBeenCalledWith( designs );
		} );
	} );
} );
