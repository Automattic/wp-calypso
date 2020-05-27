const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Returns false if the site is unlaunched or is younger than 1 week
 *
 * @param site the site object
 */
export function getShouldShowAppBanner( site: any ): boolean {
	if ( site && site.options ) {
		const olderThanAWeek = Date.now() - new Date( site.options.created_at ).getTime() > WEEK_IN_MS;
		const isLaunched = site.launch_status !== 'unlaunched';

		return olderThanAWeek && isLaunched;
	}
	return false;
}
