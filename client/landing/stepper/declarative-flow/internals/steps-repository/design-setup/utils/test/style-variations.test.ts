import { Design, StyleVariation } from 'calypso/../../packages/design-picker/src/types';
import { removeLegacyDesignVariations } from '../style-variations';

describe( 'removeLegacyDesignVariations', () => {
	it( 'removes designs that are style variation of another design', () => {
		const createDesign = ( slug: string, variationSlugs: string[] = [] ) =>
			( {
				slug,
				style_variations: variationSlugs.map(
					( variationSlug: string ) =>
						( {
							slug: variationSlug,
						} as StyleVariation )
				),
			} as Design );

		const quadratBlack = createDesign( 'quadrat-black' );
		const quadrat = createDesign( 'quadrat', [ 'black', 'green' ] );
		const quadratGreen = createDesign( 'quadrat-green' );
		const videomaker = createDesign( 'videomaker' );
		const videomakerWhite = createDesign( 'videomaker-white' );
		const zoologist = createDesign( 'zoologist' );

		const designs: Design[] = [
			quadratBlack,
			quadrat,
			quadratGreen,
			videomaker,
			videomakerWhite,
			zoologist,
		];
		expect( removeLegacyDesignVariations( designs ) ).toEqual( [
			quadrat,
			videomaker,
			videomakerWhite,
			zoologist,
		] );
	} );
} );
