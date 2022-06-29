import {
	PRODUCT_NO_ADS,
	PRODUCT_WPCOM_CUSTOM_DESIGN,
	PRODUCT_WPCOM_UNLIMITED_THEMES,
} from '@automattic/calypso-products';
import { useSelector } from 'react-redux';
import {
	getProductBySlug,
	getProductDescription,
	getProductName,
} from 'calypso/state/products-list/selectors';
import customDesignIcon from '../icons/custom-design';
import noAdsIcon from '../icons/no-ads';
import unlimitedThemesIcon from '../icons/unlimited-themes';
import useAddOnDisplayCost from './use-add-on-display-cost';

export interface AddOnMeta {
	productSlug: string;
	featured?: boolean;
	icon: JSX.Element;
	name: string | React.ReactChild | null;
	description: string | React.ReactChild | null;
	displayCost: string | React.ReactChild | null;
}

// memoize on products list
const useAddOns = (): ( AddOnMeta | null )[] => {
	const addOnsActive = [
		{
			productSlug: PRODUCT_WPCOM_UNLIMITED_THEMES,
			featured: true,
			icon: unlimitedThemesIcon,
			overrides: null,
			displayCost: useAddOnDisplayCost( PRODUCT_WPCOM_UNLIMITED_THEMES ),
		},
		{
			productSlug: PRODUCT_NO_ADS,
			featured: false,
			icon: noAdsIcon,
			overrides: null,
			displayCost: useAddOnDisplayCost( PRODUCT_NO_ADS ),
		},
		{
			productSlug: PRODUCT_WPCOM_CUSTOM_DESIGN,
			featured: false,
			icon: customDesignIcon,
			overrides: null,
			displayCost: useAddOnDisplayCost( PRODUCT_WPCOM_CUSTOM_DESIGN ),
		},
	] as const;

	return useSelector( ( state ): ( AddOnMeta | null )[] => {
		return addOnsActive.map( ( addOn ) => {
			const product = getProductBySlug( state, addOn.productSlug );
			const name = getProductName( state, addOn.productSlug );
			const description = getProductDescription( state, addOn.productSlug );

			if ( ! product ) {
				// will not render anything if product not fetched from API
				// probably need some sort of placeholder in the add-ons page instead
				return null;
			}

			return {
				...addOn,
				name,
				description,
			};
		} );
	} );
};

export default useAddOns;
