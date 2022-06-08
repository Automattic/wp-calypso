import { useSelector } from 'react-redux';
import { getProductBySlug, getProductName } from 'calypso/state/products-list/selectors';
import noAdsIcon from '../icons/no-ads';

export interface AddOnMeta {
	slug: string;
	name: string;
	description: string;
	highlight?: boolean;
	icon: JSX.Element;
}

// these are pulled from API in the hook below
const addOnsActive = [
	{
		slug: 'no-adverts/no-adverts.php',
		highlight: false,
		nameOverride: 'Remove Ads',
		icon: noAdsIcon,
	},
];

// memoize on products list
const useAddOns = () => {
	return useSelector( ( state ) => {
		return addOnsActive.map( ( addOn ) => {
			const product = getProductBySlug( state, addOn.slug );
			const productName = getProductName( state, addOn.slug );

			// will not render anything if product not fetched from API
			// - can remove and update `adOnsActive` with description, name, etc. to still render
			// - probably need some sort of placeholder in the add-ons page instead
			if ( ! product ) {
				return null;
			}

			return {
				slug: addOn.slug,
				name: addOn.nameOverride || productName,
				description: product?.description,
				highlight: addOn.highlight,
				icon: addOn.icon,
			} as AddOnMeta;
		} );
	} );
};

export default useAddOns;
