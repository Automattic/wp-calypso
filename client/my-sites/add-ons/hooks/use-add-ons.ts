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
	variations?: Partial< AddOnMeta >[];
}

const AVAILABLE_PRODUCTS = [ 50, 100 ];

const buildStorageAddOn = (
	isStorageAddonEnabled: boolean,
	currentMaxStorage: number,
	storageLimit: number
) => {
	if ( ! isStorageAddonEnabled ) {
		return null;
	}

	const availableStorageUpgrade = storageLimit - currentMaxStorage;
	const availableUpgrades = AVAILABLE_PRODUCTS.filter(
		( product ) => product <= availableStorageUpgrade
	);

	const translate = useTranslate();

	if ( availableUpgrades.length ) {
		// Default to the largest available upgrade
		const largestUpgrade = availableUpgrades[ 1 ];
		return {
			productSlug: PRODUCT_1GB_SPACE,
			icon: spaceUpgradeIcon,
			quantity: largestUpgrade,
			displayCost: useAddOnDisplayCost( PRODUCT_1GB_SPACE, largestUpgrade ),
			description: 'Add additional high-performance SSD NvME storage space to your site.',
			featured: false,
			variations: availableUpgrades.map( ( upgrade ) => ( {
				name: translate( '%(upgrade)s GB Added Space', {
					args: {
						upgrade,
					},
				} ),
				quantity: upgrade,
				displayCost: useAddOnDisplayCost( PRODUCT_1GB_SPACE, upgrade ),
			} ) ),
		};
	}

	return null;
};

// some memoization. executes far too many times
const useAddOns = (): ( AddOnMeta | null )[] => {
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
	];

	const storageAddOn = buildStorageAddOn( true, 50, 200 );
	if ( storageAddOn ) {
		addOnsActive.push( storageAddOn );
	}

	console.log( { storageAddOn } );

	return useSelector( ( state ): ( AddOnMeta | null )[] => {
		return addOnsActive.map( ( addOn ) => {
			const product = getProductBySlug( state, addOn.productSlug );
			const name = getProductName( state, addOn.productSlug );
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
