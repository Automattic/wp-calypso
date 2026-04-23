/**
 * Vega Site-Spec Configuration Tests
 *
 * Guards the ExPlat experiment name, agent ids, and the treatment config
 * additions (chips, placeholder) that ship to the widget. Spec-confirm
 * card copy (Goals / CTA / Mood) is rendered by the widget itself and is
 * not part of the Calypso-side payload.
 */
import {
	VEGA_CONTROL_AGENT_ID,
	VEGA_EXPERIMENT_NAME,
	VEGA_TREATMENT_AGENT_ID,
	getVegaAgentId,
	getVegaSiteSpecConfig,
} from '../vega';

describe( 'Vega site-spec', () => {
	describe( 'constants', () => {
		it( 'uses the month-scoped ExPlat experiment name', () => {
			expect( VEGA_EXPERIMENT_NAME ).toBe( 'wpcom_ai_website_builder_vega_site_spec_202604' );
		} );

		it( 'exposes control and treatment agent ids', () => {
			expect( VEGA_CONTROL_AGENT_ID ).toBe( 'site-spec' );
			expect( VEGA_TREATMENT_AGENT_ID ).toBe( 'vega-site-spec' );
		} );
	} );

	describe( 'getVegaAgentId', () => {
		it( 'returns the treatment agent id for the treatment variation', () => {
			expect( getVegaAgentId( 'treatment' ) ).toBe( VEGA_TREATMENT_AGENT_ID );
		} );

		it( 'returns the control agent id for the control variation', () => {
			expect( getVegaAgentId( 'control' ) ).toBe( VEGA_CONTROL_AGENT_ID );
		} );

		it( 'defaults to control when the assignment is unknown or missing', () => {
			expect( getVegaAgentId( null ) ).toBe( VEGA_CONTROL_AGENT_ID );
			expect( getVegaAgentId( undefined ) ).toBe( VEGA_CONTROL_AGENT_ID );
			expect( getVegaAgentId( 'unexpected' ) ).toBe( VEGA_CONTROL_AGENT_ID );
		} );
	} );

	describe( 'getVegaSiteSpecConfig', () => {
		const config = getVegaSiteSpecConfig();

		it( 'routes the widget to the treatment agent', () => {
			expect( config.agentId ).toBe( VEGA_TREATMENT_AGENT_ID );
		} );

		it( 'overrides the widget default build URL to avoid create_garden_site=1', () => {
			expect( config.buildSiteUrl ).toBe( '/setup/ai-site-builder/?spec_id=' );
			expect( config.buildSiteUrl ).not.toMatch( /create_garden_site/ );
		} );

		it( 'sets the treatment placeholder', () => {
			expect( config.placeholder ).toBe( 'I want to…' );
		} );

		it( 'exposes seven starter chips for the treatment screen', () => {
			const items = config.theme?.promptSuggestions?.items ?? [];
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
			const items = config.theme?.promptSuggestions?.items ?? [];
			// Each prompt answers one deepening follow-up ("what should
			// visitors do?", "how should people buy?", etc.) so the agent has
			// more than the three-word label to work with on round one.
			items.forEach( ( item ) => {
				expect( item.prompt.startsWith( item.label ) ).toBe( true );
				expect( item.prompt.length ).toBeGreaterThan( item.label.length );
			} );
		} );

		it( 'keeps chip prompts free of prescriptive design tokens', () => {
			const items = config.theme?.promptSuggestions?.items ?? [];
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
			// The spec requires the treatment headline to stay byte-identical
			// with control, so we leave it to the widget default.
			expect( config.theme?.onboardingTitle ).toBeUndefined();
			expect( config.theme?.onboardingSubtitle ).toBeUndefined();
		} );
	} );
} );
