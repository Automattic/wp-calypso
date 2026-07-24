export const LAUNCHPAD_PERSONALIZATION_EXPERIMENT = 'wpcom_launchpad_personalization_202607_v1';

export type LaunchpadPersonalizationVariation = 'control' | 'ai_launchpad' | 'no_guidance';

/**
 * Map an ExPlat variation name onto a known variation. Anything unrecognized (including
 * null/undefined for an unassigned or not-yet-loaded user) is treated as `control`,
 * so an absent or misconfigured experiment degrades to today's default behavior.
 */
export function normalizeVariation(
	variationName: string | null | undefined
): LaunchpadPersonalizationVariation {
	switch ( variationName ) {
		case 'ai_launchpad':
			return 'ai_launchpad';
		case 'no_guidance':
			return 'no_guidance';
		default:
			return 'control';
	}
}

interface DestinationArgs {
	variation: LaunchpadPersonalizationVariation;
	/** Site admin URL, guaranteed to end in a trailing slash (e.g. `https://x/wp-admin/`). */
	adminUrl: string;
	/** Append `&enable-ai-launchpad=1` for the post-checkout hand-off. Defaults to false. */
	enableAiLaunchpad?: boolean;
}

/**
 * The wp-admin destination for a treatment variation, or null for control (the caller keeps
 * its existing destination logic). `ai_launchpad` lands in Site Setup; `no_guidance`
 * lands on the plain wp-admin dashboard.
 */
export function getLaunchpadPersonalizationDestination( {
	variation,
	adminUrl,
	enableAiLaunchpad = false,
}: DestinationArgs ): string | null {
	switch ( variation ) {
		case 'ai_launchpad':
			return `${ adminUrl }admin.php?page=site-setup-wp-admin${
				enableAiLaunchpad ? '&enable-ai-launchpad=1' : ''
			}`;
		case 'no_guidance':
			return adminUrl;
		default:
			return null;
	}
}
