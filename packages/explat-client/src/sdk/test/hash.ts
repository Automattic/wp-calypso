import { hashFnv32a, hash } from '../hash';

describe( 'hashFnv32a', () => {
	it( 'returns the FNV-1a offset basis for the empty string', () => {
		expect( hashFnv32a( '' ) ).toBe( 0x811c9dc5 );
	} );

	it( 'matches the reference for a single ASCII char', () => {
		expect( hashFnv32a( 'a' ) ).toBe( 0xe40c292c );
	} );
} );

describe( 'hash', () => {
	it( 'matches the reference for ascii (a, 1)', () => {
		expect( hash( 'a', '1' ) ).toBe( 0.8633 );
	} );

	it( 'matches the reference for ascii (a, 2)', () => {
		expect( hash( 'a', '2' ) ).toBe( 0.9601 );
	} );

	it( 'matches the reference for a realistic flag/id pair', () => {
		expect( hash( 'new_checkout_2026', '42' ) ).toBe( 0.4318 );
	} );

	it( 'uses JavaScript UTF-16 semantics for unicode inputs', () => {
		expect( hash( 'é', '1' ) ).toBe( 0.312 );
		expect( hash( '中', '1' ) ).toBe( 0.4171 );
		expect( hash( '🎯', '1' ) ).toBe( 0.6133 );
	} );

	it( 'always returns a float in [0, 1)', () => {
		for ( let i = 0; i < 100; i++ ) {
			const h = hash( 'seed', String( i ) );
			expect( h ).toBeGreaterThanOrEqual( 0 );
			expect( h ).toBeLessThan( 1 );
		}
	} );
} );
