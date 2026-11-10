/**
 * Legacy `/start/launch-site` is served by Stepper's `/setup/launch-site`. Links to the old path
 * still arrive from wp-admin, wpcom, emails and bookmarks, so it stays as a redirect. Legacy step
 * segments (`/domains-launch`, `/plans-launch`, `/launch`) are dropped: the flow works out which
 * steps the site needs. So is a locale segment: launching needs a logged-in user, and Calypso
 * shows logged-in users their account language whatever the URL says.
 */
export const LEGACY_LAUNCH_SITE_FLOW = 'launch-site';

/**
 * The Stepper URL legacy `/start/launch-site` redirects to.
 * @param query Parsed query string of the incoming request.
 */
export function getLegacyLaunchSiteRedirect( query: Record< string, unknown > = {} ): string {
	const forwarded: Record< string, string > = {};

	for ( const [ arg, value ] of Object.entries( query ) ) {
		if ( typeof value === 'string' && value ) {
			forwarded[ arg ] = value;
		}
	}

	const search = new URLSearchParams( forwarded ).toString();

	return `/setup/launch-site${ search ? `?${ search }` : '' }`;
}
