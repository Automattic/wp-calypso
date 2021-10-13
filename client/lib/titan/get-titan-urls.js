/**
 * Available Titan Apps
 */
const TITAN_APPS = {
	CALENDAR: 'calendar',
	CONTACTS: 'contacts',
	EMAIL: 'email',
};

/**
 * Generates a URL pointing to the given Titan App
 *
 * @param {string?} email - The email address of the Titan account. Used for autofill on Titan's login page.
 * @param {string?} app - Can be one of the `TITAN_APPS` - `email`, `calendar` or `contacts`
 * @param {boolean?} clearPreviousSessions - Whether to clear previously logged in sessions.
 * @returns The URL with app and prefilled `email_account` as query parameter
 */
function getTitanUrl( email, app = TITAN_APPS.EMAIL, clearPreviousSessions = false ) {
	const titanBaseUrl = 'https://wp.titan.email';
	const titanAppUrl = new URL( `${ titanBaseUrl }/${ app }` );

	if ( email?.includes( '@' ) ) {
		titanAppUrl.searchParams.append( 'email_account', email );
	}

	if ( clearPreviousSessions ) {
		titanAppUrl.searchParams.append( 'clearSession', 'true' );
	}

	return titanAppUrl.href;
}

export function getTitanCalendarlUrl( email ) {
	return getTitanUrl( email, TITAN_APPS.CALENDAR );
}

export function getTitanContactsUrl( email ) {
	return getTitanUrl( email, TITAN_APPS.CONTACTS );
}

export function getTitanEmailUrl( email, clearPreviousSessions = false ) {
	return getTitanUrl( email, TITAN_APPS.EMAIL, clearPreviousSessions );
}
