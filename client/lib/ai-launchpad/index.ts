interface LaunchpadOptions {
	wpcom_ai_launchpad_enabled?: boolean;
	wpcom_ai_launchpad_no_guidance?: boolean;
}

/**
 * The wp-admin landing for a site's launchpad state, or null when the caller keeps its own default.
 * @param options  The site's options.
 * @param adminUrl Site admin URL ending in a slash, e.g. `https://x/wp-admin/`.
 */
export function getLaunchpadDestination(
	options: LaunchpadOptions | undefined,
	adminUrl: string
): string | null {
	if ( options?.wpcom_ai_launchpad_no_guidance ) {
		return adminUrl;
	}
	if ( options?.wpcom_ai_launchpad_enabled ) {
		return `${ adminUrl }admin.php?page=site-setup-wp-admin`;
	}
	return null;
}
