/**
 * Vega Site-Spec Configuration Tests
 *
 * Guards the Vega agent id and config additions (chips, placeholder) that
 * ship to the widget. Spec-confirm card copy (Goals / CTA / Mood) is
 * rendered by the widget itself and is not part of the Calypso-side payload.
 */
import config from '@automattic/calypso-config';
import { VEGA_AGENT_ID, getVegaSiteSpecConfig } from '../vega';

interface MockWithIsEnabled extends jest.Mock {
	isEnabled: jest.Mock;
}

jest.mock( '@automattic/calypso-config', () => {
	const mockFn: MockWithIsEnabled = jest.fn() as MockWithIsEnabled;
	mockFn.isEnabled = jest.fn();
	return mockFn;
} );

describe( 'Vega site-spec', () => {
	const mockConfig = config as unknown as MockWithIsEnabled;

	beforeEach( () => {
		// Default config shape covers the branch of `getDefaultSiteSpecConfig()`
		// we inherit from: populated agent URL + a different agent id and build
		// URL than Vega's, so the override assertions below would fail if the
		// spread accidentally clobbered them.
		mockConfig.mockImplementation( ( key: string ) => {
			if ( key === 'site_spec' ) {
				return {
					agent_url: 'https://api.example.com/agent',
					agent_id: 'site-spec',
					build_site_url: 'https://example.com/build?spec_id=',
				};
			}
			return undefined;
		} );
	} );

	describe( 'constants', () => {
		it( 'exposes the Vega agent id', () => {
			expect( VEGA_AGENT_ID ).toBe( 'vega-site-spec' );
		} );
	} );

	describe( 'getVegaSiteSpecConfig', () => {
		it( 'routes the widget to the Vega agent', () => {
			expect( getVegaSiteSpecConfig().agentId ).toBe( VEGA_AGENT_ID );
		} );

		it( 'overrides the widget default build URL to avoid create_garden_site=1', () => {
			const { buildSiteUrl } = getVegaSiteSpecConfig();
			expect( buildSiteUrl ).toBe( '/setup/ai-site-builder/?spec_id=' );
			expect( buildSiteUrl ).not.toMatch( /create_garden_site/ );
		} );

		it( 'inherits non-overridden defaults (e.g. agent URL, tracking)', () => {
			const config = getVegaSiteSpecConfig();
			expect( config.agentUrl ).toBe( 'https://api.example.com/agent' );
			expect( config.tracking ).toEqual(
				expect.objectContaining( { enabled: true, prefix: 'jetpack_calypso' } )
			);
		} );

		it( 'sets the Vega placeholder', () => {
			expect( getVegaSiteSpecConfig().placeholder ).toBe( 'I want to…' );
		} );

		it( 'exposes seven starter chips for the Vega screen', () => {
			const items = getVegaSiteSpecConfig().theme?.promptSuggestions?.items ?? [];
			expect( items ).toHaveLength( 7 );
			expect( items.map( ( item ) => item.label ) ).toEqual( [
				'Share my art',
				'Get new clients',
				'Attract locals',
				'Grow an audience for my writing',
				'Tell the story of my cause',
				'Keep a creative outlet',
				'Be findable online',
			] );
		} );

		it( 'extends each chip prompt beyond its visible label', () => {
			const items = getVegaSiteSpecConfig().theme?.promptSuggestions?.items ?? [];
			// Each prompt answers one deepening follow-up ("what should
			// visitors do?", "how should people buy?", etc.) so the agent has
			// more than the three-word label to work with on round one.
			items.forEach( ( item ) => {
				expect( item.prompt.startsWith( item.label ) ).toBe( true );
				expect( item.prompt.length ).toBeGreaterThan( item.label.length );
			} );
		} );

		it( 'keeps chip prompts free of prescriptive design tokens', () => {
			const items = getVegaSiteSpecConfig().theme?.promptSuggestions?.items ?? [];
			// We deliberately don't seed palette/typography in the prompts
			// — WP.com's audience is broader than CIAB's store vertical, so
			// naming fonts or hex codes would over-bias first drafts.
			const designTokens =
				/(#[0-9a-f]{3,6}\b|\bpalette\b|\btypography\b|\bserif\b|\bsans-serif\b)/i;
			items.forEach( ( item ) => {
				expect( item.prompt ).not.toMatch( designTokens );
			} );
		} );

		it( 'does not override the onboarding headline', () => {
			const { theme } = getVegaSiteSpecConfig();
			expect( theme?.onboardingTitle ).toBeUndefined();
			expect( theme?.onboardingSubtitle ).toBeUndefined();
		} );
	} );
} );
