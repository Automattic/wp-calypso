import type { AiLaunchpadSiteOptions, AiLaunchpadStatus } from './types';

/**
 * Derives the AI Launchpad state from site options, mirroring the server-side
 * eligibility gate (`AI_Launchpad::is_eligible()` in jetpack-mu-wpcom): enabled
 * and not dismissed. Keep the two in sync when the server gate changes. Only
 * administrators get the AI Launchpad, matching the wp-admin menu swap.
 *
 * - `'active'`: the AI Launchpad replaces My Home and the legacy launchpad.
 * - `'completed'`: every task is done; setup surfaces should be hidden.
 * - `null`: not eligible — legacy My Home / launchpad behavior applies, unless
 *   `isLaunchpadNoGuidance( site )` is true (no_guidance set, or enabled+dismissed),
 *   in which case no setup surface shows at all.
 */
export function getAiLaunchpadStatus( site: {
	capabilities?: { manage_options?: boolean };
	options?: AiLaunchpadSiteOptions;
} ): AiLaunchpadStatus | null {
	if ( ! site.capabilities?.manage_options ) {
		return null;
	}

	const options = site.options;
	if (
		! options?.wpcom_ai_launchpad_enabled ||
		options.wpcom_ai_launchpad_dismissed ||
		options.wpcom_launchpad_no_guidance
	) {
		return null;
	}

	return options.wpcom_ai_launchpad_completed ? 'completed' : 'active';
}

/**
 * Whether the site gets no setup guidance: true if no_guidance option is set, or if AI Launchpad was enabled and dismissed.
 */
export function isLaunchpadNoGuidance( site: { options?: AiLaunchpadSiteOptions } ): boolean {
	const options = site.options;
	return (
		!! options?.wpcom_launchpad_no_guidance ||
		( !! options?.wpcom_ai_launchpad_enabled && !! options?.wpcom_ai_launchpad_dismissed )
	);
}
