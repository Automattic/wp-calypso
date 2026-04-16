import { shouldRenderInsightsUpsell } from '../index';

describe( 'shouldRenderInsightsUpsell', () => {
	const getShouldRenderInsightsUpsell = ( {
		isStatsPaidWpcomV3Enabled = true,
		isPending = false,
		siteId = 123,
		shouldGateInsights = true,
	} = {} ) =>
		shouldRenderInsightsUpsell( {
			isStatsPaidWpcomV3Enabled,
			isPending,
			siteId,
			shouldGateInsights,
		} );

	it( 'returns false while the insights page is still loading plan usage', () => {
		expect( getShouldRenderInsightsUpsell( { isPending: true } ) ).toBe( false );
	} );

	it( 'returns false when no site is selected yet', () => {
		expect( getShouldRenderInsightsUpsell( { siteId: null } ) ).toBe( false );
	} );

	it( 'returns true only when feature is enabled and gating applies after loading', () => {
		expect( getShouldRenderInsightsUpsell() ).toBe( true );
	} );

	it( 'returns false when the paid stats feature flag is disabled', () => {
		expect( getShouldRenderInsightsUpsell( { isStatsPaidWpcomV3Enabled: false } ) ).toBe( false );
	} );

	it( 'returns false when insights are not gated for the site', () => {
		expect( getShouldRenderInsightsUpsell( { shouldGateInsights: false } ) ).toBe( false );
	} );
} );
