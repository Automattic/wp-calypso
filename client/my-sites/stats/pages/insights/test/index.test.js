import { shouldRenderInsightsUpsell } from '../index';

describe( 'shouldRenderInsightsUpsell', () => {
	it( 'returns false while plan usage is loading', () => {
		expect( shouldRenderInsightsUpsell( true, true, 123, true ) ).toBe( false );
	} );

	it( 'returns false when no site is selected yet', () => {
		expect( shouldRenderInsightsUpsell( true, false, null, true ) ).toBe( false );
	} );

	it( 'returns true only when feature is enabled and gating applies after loading', () => {
		expect( shouldRenderInsightsUpsell( true, false, 123, true ) ).toBe( true );
	} );
} );
