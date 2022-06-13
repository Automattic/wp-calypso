import { WPCOM_FEATURES_NO_ADVERTS } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getProductBySlug, getProductName } from 'calypso/state/products-list/selectors';
import noAdsIcon from '../icons/no-ads';

export interface AddOnMeta {
	slug: string;
	name: string | React.ReactChild;
	description: string | React.ReactChild;
	highlight?: boolean;
	icon: JSX.Element;
}

// memoize on products list
const useAddOns = () => {
	const translate = useTranslate();
	const addOnsActive = [
		{
			slug: WPCOM_FEATURES_NO_ADVERTS,
			highlight: false,
			icon: noAdsIcon,
			overrides: {
				// override API-fetched metadata
				name: translate( 'Remove Ads' ),
			},
		},
		{
			slug: WPCOM_FEATURES_NO_ADVERTS,
			highlight: false,
			icon: noAdsIcon,
			overrides: null,
		},
	] as const;

	return useSelector( ( state ) => {
		return addOnsActive.map( ( addOn ) => {
			const product = getProductBySlug( state, addOn.slug );
			const productName = getProductName( state, addOn.slug );

			if ( ! product ) {
				// will not render anything if product not fetched from API
				// - can remove and update `adOnsActive` with description, name, etc. to still render
				// - probably need some sort of placeholder in the add-ons page instead
				return null;
			}

			return {
				slug: addOn.slug,
				name: addOn?.overrides?.name ?? productName,
				description: product?.description,
				highlight: addOn.highlight,
				icon: addOn.icon,
			} as AddOnMeta;
		} );
	} );
};

export default useAddOns;
