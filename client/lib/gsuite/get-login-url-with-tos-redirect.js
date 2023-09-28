/**
 * Creates the Google ToS redirect url given email and domain
 * @param {string} email - email
 * @param {string} domain - domain name
 * @returns {string} - ToS url redirect
 */
export function getLoginUrlWithTOSRedirect( email, domain ) {
	return (
		'https://accounts.google.com/AccountChooser?' +
		`Email=${ encodeURIComponent( email ) }` +
		`&service=CPanel` +
		`&continue=${ encodeURIComponent(
			`https://admin.google.com/${ domain }/AcceptTermsOfService?continue=https://mail.google.com/mail/u/${ email }`
		) }`
	);
}
