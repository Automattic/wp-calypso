import { useCallback } from '@wordpress/element';
import type { SiteDetails } from '@automattic/data-stores';

/**
 * Returns a function that will return a formatted checkout link for the given add-on and quantity.
 * E.g. https://wordpress.com/checkout/<siteSlug>/<addOnSlug>>:-q-<quantity>
 *
 * @returns {Function} A function returnig a formatted checkout link for the given add-on and quantity
 */

export const useAddOnCheckoutLink = (): ( (
	siteDetails: SiteDetails | null,
	addOnSlug: string,
	quantity?: number
) => string ) => {
	const checkoutLinkCallback = useCallback(
		( siteDetails: SiteDetails, addOnSlug: string, quantity?: number ): string => {
			// If no site is provided, return the checkout link with the add-on (will render site-selector).
			if ( ! siteDetails ) {
				return `/checkout/${ addOnSlug }`;
			}

			const checkoutLinkFormat = `/checkout/${ siteDetails?.slug }/${ addOnSlug }`;

			if ( quantity ) {
				return checkoutLinkFormat + `:-q-${ quantity }`;
			}
			return checkoutLinkFormat;
		},
		[]
	);
	return checkoutLinkCallback;
};
