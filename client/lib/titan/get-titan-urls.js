/**
 * Available Titan Apps
 */
export const TITAN_APPS = {
	EMAIL: 'email',
	CALENDAR: 'calendar',
	CONTACTS: 'contacts',
};

/**
 * Generates a URL pointing to the given Titan App
 *
 * @param {string?} email - The email address of the Titan account. Used for autofill on Titan's login page.
 * @param {string?} app - Can be one of the `TITAN_APPS` - `email`, `calendar` or `contacts`
 * @returns The URL with app and prefilled `email_account` as query parameter
 */
function getTitanUrl( email, app = TITAN_APPS.EMAIL ) {
	const titanBaseUrl = 'https://wp.titan.email';
	const titanAppUrl = new URL( `${ titanBaseUrl }/${ app }` );

	if ( email?.includes( '@' ) ) {
		titanAppUrl.searchParams.append( 'email_account', email );
	}

	return titanAppUrl.href;
}

export function getTitanEmailUrl( email ) {
	return getTitanUrl( email, TITAN_APPS.EMAIL );
}

export function getTitanCalendarlUrl( email ) {
	return getTitanUrl( email, TITAN_APPS.EMAIL );
}

export function getTitanContactsUrl( email ) {
	return getTitanUrl( email, TITAN_APPS.EMAIL );
}
