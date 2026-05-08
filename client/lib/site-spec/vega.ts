import { __ } from '@wordpress/i18n';
import { getDefaultSiteSpecConfig } from './utils';
import type { SiteSpecConfig } from './utils';

/**
 * ExPlat experiment driving the Vega site-spec rollout.
 *
 * Month-scoped; keep in sync with the server-side configuration when renamed.
 */
export const VEGA_EXPERIMENT_NAME = 'wpcom_ai_website_builder_vega_site_spec_202604';

export const VEGA_CONTROL_AGENT_ID = 'site-spec';
export const VEGA_TREATMENT_AGENT_ID = 'vega-site-spec';

export type VegaVariation = 'control' | 'treatment';

/**
 * Returns the agent id for a given ExPlat variation.
 *
 * `null` / unknown variation falls back to control so users never hit the
 * treatment endpoint without a recorded assignment.
 */
export function getVegaAgentId( variation: string | null | undefined ): string {
	return variation === 'treatment' ? VEGA_TREATMENT_AGENT_ID : VEGA_CONTROL_AGENT_ID;
}

/**
 * Seven primary chips for the treatment starter screen. Selecting any of
 * these sends the prompt as the first user message to the `vega-site-spec`
 * agent.
 *
 * Each prompt extends its label by answering the single most useful follow-up
 * question an onboarder would ask (e.g. "what should visitors do?"). That
 * gives the agent enough intent + expected-visitor-action to propose a
 * structure on round one without locking in design choices.
 */
function getVegaPrimaryChips() {
	return [
		{
			label: __( 'Share my art', 'site-spec' ),
			prompt: __(
				'Share my art online. I want a place where people can see my work, get a feel for my style, and reach out if they want to buy or commission something.',
				'site-spec'
			),
		},
		{
			label: __( 'Get new clients', 'site-spec' ),
			prompt: __(
				'Get new clients. I want a site that explains what I do, shows the kind of work I’ve done, and makes it easy for the right people to get in touch.',
				'site-spec'
			),
		},
		{
			label: __( 'Attract locals', 'site-spec' ),
			prompt: __(
				'Attract locals. I want a site that shows what we do, when we’re open, where to find us, and gets people excited to come by — with a simple way to reach out or book if they need to.',
				'site-spec'
			),
		},
		{
			label: __( 'Grow an audience for my writing', 'site-spec' ),
			prompt: __(
				'Grow an audience for my writing. I want a home for my posts, a way for readers to subscribe, and a short intro so visitors know whose work they’re reading.',
				'site-spec'
			),
		},
		{
			label: __( 'Tell the story of my cause', 'site-spec' ),
			prompt: __(
				'Tell the story of my cause — what I stand for, the change I am trying to make, and the ways people can help or get involved.',
				'site-spec'
			),
		},
		{
			label: __( 'Keep a creative outlet', 'site-spec' ),
			prompt: __(
				'Keep a creative outlet. I’d like a low-pressure home for whatever I’m working on — notes, photos, side projects — somewhere that feels like mine.',
				'site-spec'
			),
		},
		{
			label: __( 'Be findable online', 'site-spec' ),
			prompt: __(
				'Be findable online. I want a simple page that says who I am, what I do, and how to get in touch, so the right people can find me when they search.',
				'site-spec'
			),
		},
	];
}

/**
 * Post-spec-confirm landing URL for the treatment variation.
 *
 * The widget bundle ships with a hardcoded default that includes
 * `create_garden_site=1`, which the AI Site Builder flow uses as a signal to
 * provision a WooCommerce garden site. Vega treatment targets the standard
 * AI Builder flow, so we override the default with a non-garden path and let
 * the widget append the `spec_id` to the trailing `=`.
 */
const VEGA_BUILD_SITE_URL = '/setup/ai-site-builder/?spec_id=';

/**
 * Returns the Calypso-side configuration for the Vega treatment variation.
 *
 * Inherits everything from `getDefaultSiteSpecConfig()` (agent URL, tracking
 * prefix, etc.) and only overrides the pieces that differ for treatment:
 * agent id, the non-garden `buildSiteUrl`, placeholder copy, and the chip
 * set. Spec-confirm card additions are rendered by the widget itself based
 * on the `vega-site-spec` agent response.
 */
export function getVegaSiteSpecConfig(): SiteSpecConfig {
	return {
		...getDefaultSiteSpecConfig(),
		agentId: VEGA_TREATMENT_AGENT_ID,
		buildSiteUrl: VEGA_BUILD_SITE_URL,
		placeholder: __( 'I want to…', 'site-spec' ),
		theme: {
			promptSuggestions: {
				enabled: true,
				items: getVegaPrimaryChips(),
			},
		},
	};
}
