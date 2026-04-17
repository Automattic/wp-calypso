/**
 * Normalizes a domain search string by stripping common URL prefixes and
 * non-domain characters, making it suitable for domain availability queries.
 * @param {string} domainName - raw input string (may include protocol, www prefix, etc.)
 * @returns {string} - cleaned domain string, or empty string if input is nullish
 */
export function getFixedDomainSearch( domainName ) {
	const domain = domainName ?? '';
	return domain
		.trim()
		.toLowerCase()
		// Strip optional leading protocol (http:// or https://) and optional www[0-9]. prefix
		.replace( /^(https?:\/\/)?(www[0-9]?\.)?/, '' )
		// Strip any remaining www[0-9]. prefix (e.g. when input was bare "www.example.com")
		.replace( /^www[0-9]?\./, '' )
		// Remove characters that are not ASCII alphanumeric, accented Latin letters
		// (À-Ö, Ù-ö, ù-ÿ, Ā-ž, Ḁ-ỿ cover the extended Latin Unicode blocks used in IDNs),
		// hyphens, dots, or spaces
		.replace( /[^a-zA-ZÀ-ÖÙ-öù-ÿĀ-žḀ-ỿ0-9-. ]/g, '' );
}
