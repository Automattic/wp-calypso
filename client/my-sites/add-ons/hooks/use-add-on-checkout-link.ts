import { useCallback } from '@wordpress/element';
import { useSelector } from 'react-redux';
import { getSelectedSite } from 'calypso/state/ui/selectors';

/**
 * Returns a function that will return a formatted checkout link for the given add-on and quantity.
 * E.g. https://wordpress.com/checkout/<siteSlug>/<addOnSlug>>:-q-<quantity>
 *
 * @returns {Function} A function returnig a formatted checkout link for the given add-on and quantity
 */

const useAddOnCheckoutLink = (): ( ( addOnSlug: string, quantity?: number ) => string ) => {
	const selectedSite = useSelector( getSelectedSite );
	const checkoutLinkCallback = useCallback(
		( addOnSlug: string, quantity?: number ): string => {
			// If no site is provided, return the checkout link with the add-on (will render site-selector).
			if ( ! selectedSite ) {
				return `/checkout/${ addOnSlug }`;
			}

			const checkoutLinkFormat = `/checkout/${ selectedSite?.slug }/${ addOnSlug }`;

			if ( quantity ) {
				return checkoutLinkFormat + `:-q-${ quantity }`;
			}
			return checkoutLinkFormat;
		},
		[ selectedSite ]
	);
	return checkoutLinkCallback;
};

export default useAddOnCheckoutLink;
