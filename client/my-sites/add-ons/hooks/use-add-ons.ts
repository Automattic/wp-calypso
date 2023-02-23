import {
	PRODUCT_WPCOM_CUSTOM_DESIGN,
	PRODUCT_WPCOM_UNLIMITED_THEMES,
	PRODUCT_WPCOM_10_GB_STORAGE,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import {
	getProductBySlug,
	getProductDescription,
	getProductName,
} from 'calypso/state/products-list/selectors';
import customDesignIcon from '../icons/custom-design';
import unlimitedThemesIcon from '../icons/unlimited-themes';
import isStorageAddonAvailable from '../is-storage-addon-available';
import useAddOnDisplayCost from './use-add-on-display-cost';
import useAddOnFeatureSlugs from './use-add-on-feature-slugs';
export interface AddOnMeta {
	productSlug: string;
	featureSlugs?: string[] | null;
	icon: JSX.Element;
	featured?: boolean; // irrelevant to "featureSlugs"
	name: string | React.ReactChild | null;
	overrides?: Partial< Record< keyof AddOnMeta, React.ReactChild > > | null;
	description: string | React.ReactChild | null;
	displayCost: string | React.ReactChild | null;
}

// some memoization. executes far too many times
const useAddOns = (): ( AddOnMeta | null )[] => {
	const translate = useTranslate();
	const storageAddon = {
		productSlug: PRODUCT_WPCOM_10_GB_STORAGE,
		featureSlugs: useAddOnFeatureSlugs( PRODUCT_WPCOM_10_GB_STORAGE ),
		icon: customDesignIcon,
		overrides: {
			description: translate( 'Add 10 GB of high-performance SSD storage space to your site.' ),
			name: translate( 'Additional Storage Space' ),
		},
		displayCost: useAddOnDisplayCost( PRODUCT_WPCOM_10_GB_STORAGE ),
		featured: true,
	};

	const addOnsActive = [
		...( isStorageAddonAvailable() ? [ storageAddon ] : [] ),
		{
			productSlug: PRODUCT_WPCOM_UNLIMITED_THEMES,
			featureSlugs: useAddOnFeatureSlugs( PRODUCT_WPCOM_UNLIMITED_THEMES ),
			icon: unlimitedThemesIcon,
			overrides: null,
			displayCost: useAddOnDisplayCost( PRODUCT_WPCOM_UNLIMITED_THEMES ),
			featured: true,
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
			const name = addOn.overrides?.name ?? getProductName( state, addOn.productSlug );
			const description =
				addOn.overrides?.description ?? getProductDescription( state, addOn.productSlug );

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
