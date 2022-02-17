/**
 * Available Titan Apps
 */
const TITAN_APPS = {
	CALENDAR: 'calendar',
	CONTACTS: 'contacts',
	EMAIL: 'mail',
};

/**
 * Returns the base URL for Titan Apps
 *
 * @param {undefined|{titanMailSubscription?:{appsUrl?: string}}} domain - Domain object
 * @returns {string} - The Apps URL prefix
 */
export function getTitanAppsUrlPrefix( domain ) {
	return domain?.titanMailSubscription?.appsUrl ?? 'https://wp.titan.email';
}

/**
 * Generates a URL pointing to the given Titan App
 *
 * @param {string} titanAppsUrlPrefix - The base url for Titan Apps
 * @param {string?} email - The email address of the Titan account. Used for autofill on Titan's login page.
 * @param {string?} app - Can be one of the `TITAN_APPS` - `email`, `calendar` or `contacts`
 * @param {boolean?} clearPreviousSessions - Whether to clear previously logged-in sessions.
 * @returns The URL with app and prefilled `email_account` as query parameter
 */
function getTitanUrl(
	titanAppsUrlPrefix,
	email,
	app = TITAN_APPS.EMAIL,
	clearPreviousSessions = false
) {
	const titanAppUrl = new URL( `${ titanAppsUrlPrefix }/${ app }/` );

	if ( email?.includes( '@' ) ) {
		titanAppUrl.searchParams.append( 'email_account', email );
	}

	if ( clearPreviousSessions ) {
		titanAppUrl.searchParams.append( 'clearSession', 'true' );
	}

	return titanAppUrl.href;
}

export function getTitanCalendarUrl( titanAppsUrlPrefix, email ) {
	return getTitanUrl( titanAppsUrlPrefix, email, TITAN_APPS.CALENDAR );
}

export function getTitanContactsUrl( titanAppsUrlPrefix, email ) {
	return getTitanUrl( titanAppsUrlPrefix, email, TITAN_APPS.CONTACTS );
}

export function getTitanEmailUrl( titanAppsUrlPrefix, email, clearPreviousSessions = false ) {
	return getTitanUrl( titanAppsUrlPrefix, email, TITAN_APPS.EMAIL, clearPreviousSessions );
}
