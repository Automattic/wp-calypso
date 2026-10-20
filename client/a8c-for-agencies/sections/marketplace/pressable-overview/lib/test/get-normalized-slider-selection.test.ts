import getNormalizedSliderSelection from '../get-normalized-slider-selection';

describe( 'getNormalizedSliderSelection', () => {
	it( 'keeps a selected option that is above the minimum', () => {
		expect( getNormalizedSliderSelection( 4, 3, 10 ) ).toBe( 4 );
	} );

	it( 'moves a selected option below the minimum to the first eligible option', () => {
		expect( getNormalizedSliderSelection( 1, 3, 10 ) ).toBe( 3 );
	} );

	it( 'keeps a missing selection for the parent state to restore', () => {
		expect( getNormalizedSliderSelection( -1, 3, 10 ) ).toBe( -1 );
	} );

	it( 'keeps a custom option above the minimum', () => {
		expect( getNormalizedSliderSelection( 10, 3, 11 ) ).toBe( 10 );
	} );

	it( 'keeps the selected option when no eligible option exists', () => {
		expect( getNormalizedSliderSelection( 2, 10, 10 ) ).toBe( 2 );
	} );
} );
