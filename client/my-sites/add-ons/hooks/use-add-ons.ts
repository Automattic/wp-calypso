import {
	PRODUCT_WPCOM_CUSTOM_DESIGN,
	PRODUCT_WPCOM_UNLIMITED_THEMES,
	PRODUCT_1GB_SPACE,
} from '@automattic/calypso-products';
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
	variations?: Partial< AddOnMeta >[];
}

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
		{
			productSlug: PRODUCT_1GB_SPACE,
			icon: spaceUpgradeIcon,
			quantity: 50,
			displayCost: useAddOnDisplayCost( PRODUCT_1GB_SPACE, 50 ),
			description: 'Add additional high-performance SSD NvME storage space to your site.',
			featured: false,
			variations: [
				{
					name: '50GB Added Space',
					quantity: 50,
					displayCost: useAddOnDisplayCost( PRODUCT_1GB_SPACE, 50 ),
				},
				{
					name: '100GB Added Space',
					quantity: 100,
					displayCost: useAddOnDisplayCost( PRODUCT_1GB_SPACE, 100 ),
				},
			],
		},
	];

	if ( ! isStorageAddonAvailable() ) {
		addOnsActive.pop();
	}

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
