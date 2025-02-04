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
 * @param {import('calypso/lib/domains/types').ResponseDomain|undefined} domain - Domain object
 * @returns {string} - The Apps URL prefix
 */
export function getTitanAppsUrlPrefix( domain ) {
	return domain?.titanMailSubscription?.appsUrl ?? 'https://wp.titan.email';
}

/**
 * Generates a URL pointing to the given Titan App
 * @param {string} titanAppsUrlPrefix - The base url for Titan Apps
 * @param {string?} email - The email address of the Titan account. Used for autofill on Titan's login page.
 * @param {string?} app - Can be one of the `TITAN_APPS` - `email`, `calendar` or `contacts`
 * @param {boolean?} clearPreviousSessions - Whether to clear previously logged-in sessions.
 * @param {string?} redirectUrl - Where the Professional Email client should redirect the user back to WordPress.
 * @returns {string} The URL with app and prefilled `email_account` as query parameter
 */
function getTitanUrl(
	titanAppsUrlPrefix,
	email,
	app = TITAN_APPS.EMAIL,
	clearPreviousSessions = false,
	redirectUrl = null
) {
	const titanAppUrl = new URL( `${ titanAppsUrlPrefix }/${ app }/` );

	if ( email?.includes( '@' ) ) {
		titanAppUrl.searchParams.append( 'email_account', email );
	}

	if ( redirectUrl ) {
		titanAppUrl.searchParams.append( 'topbar.redirect_url', redirectUrl );
	}

	if ( clearPreviousSessions ) {
		titanAppUrl.searchParams.append( 'clearSession', 'true' );
	}

	return titanAppUrl.href;
}

/**
 * Gets the Web client URL for Professional Email
 * @param { string } titanAppsUrlPrefix URL prefix to build the final URL based on the next parameters
 * @param { string | undefined } email Email account is going to be used
 * @param { boolean } clearPreviousSessions Flag to clear session in the Web Client
 * @param { string } redirectUrl URL to go back from the Web Client
 * @returns { string } Path to be used to send the user to the Web Client
 */
export function getTitanEmailUrl(
	titanAppsUrlPrefix,
	email,
	clearPreviousSessions = false,
	redirectUrl = null
) {
	return getTitanUrl(
		titanAppsUrlPrefix,
		email,
		TITAN_APPS.EMAIL,
		clearPreviousSessions,
		redirectUrl
	);
}
