import { BoardLayout } from '../board';
import { GalleryLayout } from '../gallery';
import { MagazineLayout } from '../magazine';
import { DEFAULT_SPACE_FEED_LAYOUT, getLayout } from '../registry';
import { StandardListLayout } from '../standard-list';

describe( 'getLayout', () => {
	it( 'maps each known layout to its component', () => {
		expect( getLayout( 'standard-list' ) ).toBe( StandardListLayout );
		expect( getLayout( 'magazine' ) ).toBe( MagazineLayout );
		expect( getLayout( 'gallery' ) ).toBe( GalleryLayout );
		expect( getLayout( 'board' ) ).toBe( BoardLayout );
	} );

	it( 'falls back to the standard list when the layout is undefined', () => {
		expect( getLayout( undefined ) ).toBe( StandardListLayout );
		expect( DEFAULT_SPACE_FEED_LAYOUT ).toBe( 'standard-list' );
	} );

	it( 'falls back to the standard list for an unknown layout value', () => {
		// A space whose `feed` names a layout that isn't built yet still renders.
		expect( getLayout( 'unbuilt-layout' as never ) ).toBe( StandardListLayout );
	} );
} );
