import {
	PRODUCT_NO_ADS,
	PRODUCT_WPCOM_CUSTOM_DESIGN,
	PRODUCT_WPCOM_UNLIMITED_THEMES,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
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
import useAddOnFeatureSlugs from './use-add-on-feature-slugs';

export interface AddOnMeta {
	productSlug: string;
	featureSlugs?: string[] | null;
	icon: JSX.Element;
	featured?: boolean; // irrelevant to "featureSlugs"
	name: string | React.ReactChild | null;
	description: string | React.ReactChild | null;
	displayCost: string | React.ReactChild | null;
}

// some memoization. executes far too many times
const useAddOns = (): ( AddOnMeta | null )[] => {
	const translate = useTranslate();
	const addOnsActive = [
		{
			productSlug: PRODUCT_WPCOM_UNLIMITED_THEMES,
			featureSlugs: useAddOnFeatureSlugs( PRODUCT_WPCOM_UNLIMITED_THEMES ),
			icon: unlimitedThemesIcon,
			overrides: null,
			displayCost: useAddOnDisplayCost( PRODUCT_WPCOM_UNLIMITED_THEMES ),
			featured: true,
		},
		{
			productSlug: PRODUCT_NO_ADS,
			featureSlugs: useAddOnFeatureSlugs( PRODUCT_NO_ADS ),
			icon: noAdsIcon,
			overrides: {
				// override API-fetched metadata
				name: translate( 'Remove Ads' ),
			},
			displayCost: useAddOnDisplayCost( PRODUCT_NO_ADS ),
			featured: false,
		},
		{
			productSlug: PRODUCT_WPCOM_CUSTOM_DESIGN,
			featureSlugs: useAddOnFeatureSlugs( PRODUCT_WPCOM_CUSTOM_DESIGN ),
			icon: customDesignIcon,
			overrides: null,
			displayCost: useAddOnDisplayCost( PRODUCT_WPCOM_CUSTOM_DESIGN ),
			featured: false,
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
				name: addOn.overrides?.name ?? name,
				description,
			};
		} );
	} );
};

export default useAddOns;
