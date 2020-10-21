const HOUR_IN_MS = 60 * 60 * 1000;

/**
 * Returns false if the site is unlaunched or is younger than 1 hour
 *
 * @param site the site object
 */
export function getShouldShowAppBanner( site: any ): boolean {
	if ( site && site.options ) {
		const olderThanAnHour = Date.now() - new Date( site.options.created_at ).getTime() > HOUR_IN_MS;
		const isLaunched = site.launch_status !== 'unlaunched';

		return olderThanAnHour && isLaunched;
	}
	return false;
}
