import { isLaunchpadNoGuidance, type AiLaunchpadSiteOptions } from '@automattic/api-core';

/**
 * The wp-admin landing for a site's launchpad state, or null when the caller keeps its own default.
 * @param options  The site's options.
 * @param adminUrl Site admin URL ending in a slash, e.g. `https://x/wp-admin/`.
 */
export function getLaunchpadDestination(
	options: AiLaunchpadSiteOptions | undefined,
	adminUrl: string
): string | null {
	// Only called right after signup, where the user is the site's administrator.
	if ( isLaunchpadNoGuidance( { capabilities: { manage_options: true }, options } ) ) {
		return adminUrl;
	}
	if ( options?.wpcom_ai_launchpad_enabled ) {
		return `${ adminUrl }admin.php?page=site-setup-wp-admin`;
	}
	return null;
}
