const HOUR_IN_MS = 1000 * 60 * 60;

/**
 * Returns false if the site is unlauched or is younger than 1 hour
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
