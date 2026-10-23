/**
 * The retired `/start/rewind-setup` flow asked for a site's server credentials so Jetpack Backup
 * could run. Credentials are now entered in the site's Jetpack settings.
 */
export const LEGACY_REWIND_SETUP_FLOW = 'rewind-setup';

/**
 * The credentials section of a site's Jetpack settings, or the Activity Log site picker without a site.
 * @param siteSlug The site whose credentials need entering.
 */
export function getLegacyRewindSetupRedirect( siteSlug?: unknown ): string {
	return typeof siteSlug === 'string' && siteSlug
		? `/settings/jetpack/${ siteSlug }#credentials`
		: '/activity-log';
}
