import { getThemeIdFromStylesheet } from '../utils';

describe( '#getThemeIdFromStylesheet()', () => {
	test( "should return the argument if it doesn't contain a slash (/)", () => {
		const themeId = getThemeIdFromStylesheet( 'twentysixteen' );
		expect( themeId ).toEqual( 'twentysixteen' );
	} );

	test( "should return argument's part after the slash if it does contain a slash (/)", () => {
		const themeId = getThemeIdFromStylesheet( 'pub/twentysixteen' );
		expect( themeId ).toEqual( 'twentysixteen' );
	} );
} );
