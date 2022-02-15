/**
 * Available Titan Apps
 */
const TITAN_APPS = {
	CALENDAR: 'calendar',
	CONTACTS: 'contacts',
	EMAIL: 'mail',
};

/**
 * Generates a URL pointing to the given Titan App
 *
 * @param {undefined|{titanMailSubscription?:{baseUrl?: string}}} domain - Domain object
 * @param {string?} email - The email address of the Titan account. Used for autofill on Titan's login page.
 * @param {string?} app - Can be one of the `TITAN_APPS` - `email`, `calendar` or `contacts`
 * @param {boolean?} clearPreviousSessions - Whether to clear previously logged-in sessions.
 * @returns The URL with app and prefilled `email_account` as query parameter
 */
function getTitanUrl( domain, email, app = TITAN_APPS.EMAIL, clearPreviousSessions = false ) {
	const titanBaseUrl = domain?.titanMailSubscription?.baseUrl ?? 'https://wp.titan.email';
	const titanAppUrl = new URL( `${ titanBaseUrl }/${ app }/` );

	if ( email?.includes( '@' ) ) {
		titanAppUrl.searchParams.append( 'email_account', email );
	}

	if ( clearPreviousSessions ) {
		titanAppUrl.searchParams.append( 'clearSession', 'true' );
	}

	return titanAppUrl.href;
}

export function getTitanCalendarUrl( domain, email ) {
	return getTitanUrl( domain, email, TITAN_APPS.CALENDAR );
}

export function getTitanContactsUrl( domain, email ) {
	return getTitanUrl( domain, email, TITAN_APPS.CONTACTS );
}

export function getTitanEmailUrl( domain, email, clearPreviousSessions = false ) {
	return getTitanUrl( domain, email, TITAN_APPS.EMAIL, clearPreviousSessions );
}
