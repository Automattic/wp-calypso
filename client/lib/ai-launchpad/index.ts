import {
	getAiLaunchpadStatus,
	isLaunchpadNoGuidance,
	type AiLaunchpadSiteOptions,
} from '@automattic/api-core';

const SITE_SETUP_PAGE = 'admin.php?page=site-setup-wp-admin';

/**
 * The wp-admin landing for a site's launchpad state, or null when the caller keeps its own default.
 * @param options  The site's options.
 * @param adminUrl Site admin URL ending in a slash, e.g. `https://x/wp-admin/`.
 */
export function getLaunchpadDestination(
	options: AiLaunchpadSiteOptions | undefined,
	adminUrl: string
): string | null {
	// Only called right after signup or checkout, where the user is the site's administrator.
	if ( isLaunchpadNoGuidance( { capabilities: { manage_options: true }, options } ) ) {
		return adminUrl;
	}
	if ( options?.wpcom_ai_launchpad_enabled ) {
		return `${ adminUrl }${ SITE_SETUP_PAGE }`;
	}
	return null;
}

/**
 * The Site Setup URL while the site's AI Launchpad is active (not dismissed, completed or no-guidance), or null.
 * @param options  The site's options.
 * @param adminUrl Site admin URL ending in a slash, e.g. `https://x/wp-admin/`.
 */
export function getSiteSetupDestination(
	options: AiLaunchpadSiteOptions | undefined,
	adminUrl: string
): string | null {
	// Only called right after signup or checkout, where the user is the site's administrator.
	const status = getAiLaunchpadStatus( { capabilities: { manage_options: true }, options } );
	return status === 'active' ? `${ adminUrl }${ SITE_SETUP_PAGE }` : null;
}
