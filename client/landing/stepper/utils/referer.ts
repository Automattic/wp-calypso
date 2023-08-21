/**
 * Set the affiliate tracking cookie with provided data.
 *
 * @param {number} vendorId - The product vendor id.
 * @param {string} refererId - The affiliate's referer ID.
 * @param {string|null} campaignId - The campaign ID (optional).
 * @param {string|null} subId - The sub ID (optional).
 */
export const setAffiliateCookie = (
	vendorId: number,
	refererId: string,
	campaignId: string | null,
	subId: string | null
): void => {
	// Define cookie expiration date (30 days from now)
	const expirationDate = new Date( new Date().getTime() + 30 * 24 * 60 * 60 * 1000 ).toUTCString();

	// Define cookie options for path and expiration date
	const cookieOptions = `path=/; expires=${ expirationDate };`;

	// Construct the affiliate cookie data object
	const affiliateCookieData = {
		[ vendorId ]: {
			affiliate_id: refererId,
			campaign_id: campaignId || '',
			sub_id: subId || '',
		},
	};

	// Convert the affiliate cookie data object to a JSON string and set the cookie
	document.cookie = `wp-affiliate-tracker=${ encodeURIComponent(
		JSON.stringify( affiliateCookieData )
	) }; ${ cookieOptions }`;
};
