import {
	PRODUCT_WPCOM_CUSTOM_DESIGN,
	PRODUCT_WPCOM_UNLIMITED_THEMES,
	PRODUCT_1GB_SPACE,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import useMediaStorageQuery from 'calypso/data/media-storage/use-media-storage-query';
import { useSelector } from 'calypso/state';
import {
	getProductBySlug,
	getProductDescription,
	getProductName,
} from 'calypso/state/products-list/selectors';
import { STORAGE_LIMIT } from '../constants';
import customDesignIcon from '../icons/custom-design';
import spaceUpgradeIcon from '../icons/space-upgrade';
import unlimitedThemesIcon from '../icons/unlimited-themes';
import isStorageAddonEnabled from '../is-storage-addon-enabled';
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
const useAddOns = ( siteId?: number ): ( AddOnMeta | null )[] => {
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

	// try to build storage add ons
	const { data: mediaStorage } = useMediaStorageQuery( siteId );

	const filteredAddOns = addOnsActive.filter( ( addOn ) => {
		// if it's a storage add on
		if ( addOn.productSlug === PRODUCT_1GB_SPACE ) {
			// if storage add ons are not enabled in the config, remove them
			if ( ! isStorageAddonEnabled() ) {
				return false;
			}

			const currentMaxStorage = mediaStorage?.max_storage_bytes / Math.pow( 1024, 3 );
			const availableStorageUpgrade = STORAGE_LIMIT - currentMaxStorage;

			// if the current storage add on option is greater than the available upgrade, remove it
			if ( ( addOn.quantity as number ) > availableStorageUpgrade ) {
				return false;
			}
		}

		return true;
	} );

	return useSelector( ( state ): ( AddOnMeta | null )[] => {
		return filteredAddOns.map( ( addOn ) => {
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
