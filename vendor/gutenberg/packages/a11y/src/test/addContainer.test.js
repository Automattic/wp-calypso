import addContainer from '../addContainer';

describe( 'addContainer', () => {
	describe( 'with polite param', () => {
		it( 'should create an aria-live element with aria-live attr set to polite', () => {
			const container = addContainer( 'polite' );

			expect( container ).not.toBe( null );
			expect( container.className ).toBe( 'a11y-speak-region' );
			expect( container.id ).toBe( 'a11y-speak-polite' );
			expect( container.getAttribute( 'style' ) ).not.toBeNull();
			expect( container.getAttribute( 'aria-live' ) ).toBe( 'polite' );
			expect( container.getAttribute( 'aria-relevant' ) ).toBe( 'additions text' );
			expect( container.getAttribute( 'aria-atomic' ) ).toBe( 'true' );
		} );
	} );

	describe( 'with assertive param', () => {
		it( 'should create an aria-live element with aria-live attr set to assertive', () => {
			const container = addContainer( 'assertive' );

			expect( container ).not.toBe( null );
			expect( container.className ).toBe( 'a11y-speak-region' );
			expect( container.id ).toBe( 'a11y-speak-assertive' );
			expect( container.getAttribute( 'style' ) ).not.toBeNull();
			expect( container.getAttribute( 'aria-live' ) ).toBe( 'assertive' );
			expect( container.getAttribute( 'aria-relevant' ) ).toBe( 'additions text' );
			expect( container.getAttribute( 'aria-atomic' ) ).toBe( 'true' );
		} );
	} );

	describe( 'without param', () => {
		it( 'should default to creating an aria-live element with aria-live attr set to polite', () => {
			const container = addContainer( 'polite' );

			expect( container ).not.toBe( null );
			expect( container.className ).toBe( 'a11y-speak-region' );
			expect( container.id ).toBe( 'a11y-speak-polite' );
			expect( container.getAttribute( 'style' ) ).not.toBeNull();
			expect( container.getAttribute( 'aria-live' ) ).toBe( 'polite' );
			expect( container.getAttribute( 'aria-relevant' ) ).toBe( 'additions text' );
			expect( container.getAttribute( 'aria-atomic' ) ).toBe( 'true' );
		} );
	} );
} );
