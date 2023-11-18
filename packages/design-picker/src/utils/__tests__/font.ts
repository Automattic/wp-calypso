import '../../constants';
import { getFontTitle } from '../fonts';
import type { Font } from '../../types';

jest.mock( '../../constants', () => ( {
	FONT_TITLES: {
		[ 'Chivo' as Font ]: 'Chivo title',
	},
} ) );

describe( 'Design Picker font utils', () => {
	describe( 'getFontTitle', () => {
		it( 'should return the same font family name if there is no match found', () => {
			const font: Font = 'Cabin';
			expect( getFontTitle( font ) ).toEqual( font );
		} );
		it( 'should return the font title if there is a match', () => {
			expect( getFontTitle( 'Chivo' ) ).toEqual( 'Chivo title' );
		} );
	} );
} );
