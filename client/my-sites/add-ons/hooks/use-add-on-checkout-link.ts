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

	return ( addOnSlug: string, quantity?: number ): string => {
		const checkoutLinkFormat = `/checkout/${ selectedSite?.slug }/${ addOnSlug }`;

		if ( quantity ) {
			return checkoutLinkFormat + `:-q-${ quantity }`;
		}
		return checkoutLinkFormat;
	};
};

export default useAddOnCheckoutLink;
