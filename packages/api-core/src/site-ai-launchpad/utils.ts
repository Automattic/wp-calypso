import type { AiLaunchpadSiteOptions, AiLaunchpadStatus } from './types';

/**
 * Derives the AI Launchpad state from site options, mirroring the server-side
 * eligibility gate (`AI_Launchpad::is_eligible()` in jetpack-mu-wpcom): enabled,
 * not dismissed, and not already onboarded through an AI flow. Keep the two in
 * sync when the server gate changes. Only administrators get the AI Launchpad,
 * matching the wp-admin menu swap.
 *
 * - `'active'`: the AI Launchpad replaces My Home and the legacy launchpad.
 * - `'completed'`: every task is done; setup surfaces should be hidden.
 * - `null`: not eligible — legacy My Home / launchpad behavior applies.
 */
export function getAiLaunchpadStatus( site: {
	capabilities?: { manage_options?: boolean };
	options?: AiLaunchpadSiteOptions;
} ): AiLaunchpadStatus | null {
	if ( ! site.capabilities?.manage_options ) {
		return null;
	}

	const options = site.options;
	if ( ! options?.wpcom_ai_launchpad_enabled || options.wpcom_ai_launchpad_dismissed ) {
		return null;
	}

	if (
		options.site_intent === 'ai-assembler' ||
		options.site_creation_flow === 'ai-site-builder'
	) {
		return null;
	}

	return options.wpcom_ai_launchpad_completed ? 'completed' : 'active';
}
