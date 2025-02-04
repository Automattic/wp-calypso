/**
 * Generates an url pointing to the Google Account Chooser page for the specified service.
 * @param {string} emailOrDomain - email or domain name
 * @param {string} service - identifier of the service
 * @param {string} url - url of the service
 * @param {string} template - optional template name that can be used to customize the title of the Account Chooser page
 * @returns {string} - the corresponding url
 */
function getAccountChooserUrl( emailOrDomain, service, url, template ) {
	const accountChooserUrl = new URL( 'https://accounts.google.com/AccountChooser' );

	accountChooserUrl.searchParams.append( 'service', service );
	accountChooserUrl.searchParams.append( 'continue', url );

	if ( emailOrDomain.includes( '@' ) ) {
		accountChooserUrl.searchParams.append( 'Email', emailOrDomain );
	} else {
		accountChooserUrl.searchParams.append( 'hd', emailOrDomain );
	}

	if ( template ) {
		accountChooserUrl.searchParams.append( 'ltmpl', template );
	}

	return accountChooserUrl.href;
}

/**
 * Generates an url pointing to Gmail.
 * @param {string} emailOrDomain - email or domain name
 * @returns {string} - the corresponding url
 */
export function getGmailUrl( emailOrDomain ) {
	return getAccountChooserUrl( emailOrDomain, 'mail', 'https://mail.google.com/mail/' );
}

/**
 * Generates an url pointing to Google Admin.
 * @param {string} emailOrDomain - email or domain name
 * @returns {string} - the corresponding url
 */
export function getGoogleAdminUrl( emailOrDomain ) {
	return getAccountChooserUrl( emailOrDomain, 'CPanel', 'https://admin.google.com/' );
}

/**
 * Generates an url pointing to Google Admin and its Reseller ToS page for the specified user.
 * @param {string} domainName - domain name
 * @returns {string} - the corresponding url
 */
export function getGoogleAdminWithTosUrl( domainName ) {
	return getAccountChooserUrl(
		domainName,
		'CPanel',
		`https://admin.google.com/${ domainName }/AcceptTermsOfService`
	);
}

/**
 * Generates an url pointing to Google Calendar.
 * @param {string} emailOrDomain - email or domain name
 * @returns {string} - the corresponding url
 */
export function getGoogleCalendarUrl( emailOrDomain ) {
	return getAccountChooserUrl( emailOrDomain, 'cl', 'https://calendar.google.com/calendar/' );
}

/**
 * Generates an url pointing to Google Docs.
 * @param {string} emailOrDomain - email or domain name
 * @returns {string} - the corresponding url
 */
export function getGoogleDocsUrl( emailOrDomain ) {
	return getAccountChooserUrl( emailOrDomain, 'wise', 'https://docs.google.com/document/', 'docs' );
}

/**
 * Generates an url pointing to Google Drive.
 * @param {string} emailOrDomain - email or domain name
 * @returns {string} - the corresponding url
 */
export function getGoogleDriveUrl( emailOrDomain ) {
	return getAccountChooserUrl( emailOrDomain, 'wise', 'https://drive.google.com/drive/' );
}

/**
 * Generates an url pointing to Google Sheet.
 * @param {string} emailOrDomain - email or domain name
 * @returns {string} - the corresponding url
 */
export function getGoogleSheetsUrl( emailOrDomain ) {
	return getAccountChooserUrl(
		emailOrDomain,
		'wise',
		'https://docs.google.com/spreadsheets/',
		'sheets'
	);
}

/**
 * Generates an url pointing to Google Slides.
 * @param {string} emailOrDomain - email or domain name
 * @returns {string} - the corresponding url
 */
export function getGoogleSlidesUrl( emailOrDomain ) {
	return getAccountChooserUrl(
		emailOrDomain,
		'wise',
		'https://docs.google.com/presentation/',
		'slides'
	);
}
