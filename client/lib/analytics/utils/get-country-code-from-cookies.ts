/**
 * Returns a boolean indicating whether the country for the request is known.
 *
 * @param cookies The cookies to read user data from.
 * @param defaultCountryCode A default country code to fall back to.
 *
 * @returns Whether the current user could be in the GDPR zone
 */
export default function getCountryCodeFromCookies(
	cookies: Record< string, string >,
	defaultCountryCode?: string
): string | undefined {
	// Look for the country code in the cookies first.
	const countryCode = ( cookies || {} ).country_code || defaultCountryCode || undefined;

	return countryCode === 'unknown' ? undefined : countryCode;
}
