import {
	PRODUCT_WPCOM_CUSTOM_DESIGN,
	PRODUCT_WPCOM_UNLIMITED_THEMES,
	PRODUCT_1GB_SPACE,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import {
	getProductBySlug,
	getProductDescription,
	getProductName,
} from 'calypso/state/products-list/selectors';
import customDesignIcon from '../icons/custom-design';
import spaceUpgradeIcon from '../icons/space-upgrade';
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
	quantity?: number;
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
			productSlug: PRODUCT_WPCOM_CUSTOM_DESIGN,
			featureSlugs: useAddOnFeatureSlugs( PRODUCT_WPCOM_CUSTOM_DESIGN ),
			icon: customDesignIcon,
			overrides: null,
			displayCost: useAddOnDisplayCost( PRODUCT_WPCOM_CUSTOM_DESIGN ),
			featured: false,
		},
		{
			productSlug: PRODUCT_1GB_SPACE,
			icon: spaceUpgradeIcon,
			quantity: 50,
			name: translate( '50 GB Storage' ),
			displayCost: useAddOnDisplayCost( PRODUCT_1GB_SPACE, 50 ),
			description: translate(
				'Make more space for high-quality photos, videos, and other media. '
			),
			featured: false,
		},
		{
			productSlug: PRODUCT_1GB_SPACE,
			icon: spaceUpgradeIcon,
			quantity: 100,
			name: translate( '100 GB Storage' ),
			displayCost: useAddOnDisplayCost( PRODUCT_1GB_SPACE, 100 ),
			description: translate(
				'Take your site to the next level. Store all your media in one place without worrying about running out of space.'
			),
			featured: false,
		},
	];

	if ( ! isStorageAddonAvailable() ) {
		addOnsActive.pop();
	}

	return useSelector( ( state ): ( AddOnMeta | null )[] => {
		return addOnsActive.map( ( addOn ) => {
			const product = getProductBySlug( state, addOn.productSlug );
			const name = addOn.name ? addOn.name : getProductName( state, addOn.productSlug );
			const description = addOn.description ?? getProductDescription( state, addOn.productSlug );

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
