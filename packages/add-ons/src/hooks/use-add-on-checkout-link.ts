/**
 * Returns a function that will return a formatted checkout link for the given add-on and quantity.
 * E.g. https://wordpress.com/checkout/<siteSlug>/<addOnSlug>>:-q-<quantity>
 *
 * @returns {Function} A function returnig a formatted checkout link for the given add-on and quantity
 */

export const useAddOnCheckoutLink = (): ( (
	selectedSiteSlug: string | undefined,
	addOnSlug: string,
	quantity?: number
) => string ) => {
	return ( selectedSiteSlug: string | undefined, addOnSlug: string, quantity?: number ): string => {
		// If no site is provided, return the checkout link with the add-on (will render site-selector).
		if ( ! selectedSiteSlug ) {
			return `/checkout/${ addOnSlug }`;
		}

		const checkoutLinkFormat = `/checkout/${ selectedSiteSlug }/${ addOnSlug }`;

		if ( quantity ) {
			return checkoutLinkFormat + `:-q-${ quantity }`;
		}
		return checkoutLinkFormat;
	};
};
