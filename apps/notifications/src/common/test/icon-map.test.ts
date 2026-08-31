import { getNoticonName } from '../icon-map';

describe( 'getNoticonName', () => {
	it( 'maps known glyphs to their semantic names', () => {
		expect( getNoticonName( '' ) ).toBe( 'reply' );
		expect( getNoticonName( '' ) ).toBe( 'mention' );
		expect( getNoticonName( '' ) ).toBe( 'stats' );
	} );

	it( 'falls back to info for unknown glyphs', () => {
		expect( getNoticonName( '' ) ).toBe( 'info' );
		expect( getNoticonName( '' ) ).toBe( 'info' );
	} );
} );
