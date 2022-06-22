import {
	WPCOM_FEATURES_NO_ADVERTS,
	WPCOM_FEATURES_CUSTOM_DESIGN,
	WPCOM_FEATURES_UNLIMITED_THEMES,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import {
	getProductBySlug,
	getProductDescription,
	getProductDisplayCost,
	getProductName,
	getProductTerm,
} from 'calypso/state/products-list/selectors';
import customDesignIcon from '../icons/custom-design';
import noAdsIcon from '../icons/no-ads';
import unlimitedThemesIcon from '../icons/unlimited-themes';

export interface AddOnMeta {
	slug: string;
	featured?: boolean;
	icon: JSX.Element;
	name: string | React.ReactChild | null;
	description: string | React.ReactChild | null;
	displayCost: string | React.ReactChild | null;
	term?: string | React.ReactChild | null; // year, month, etc.
}

// memoize on products list
const useAddOns = (): ( AddOnMeta | null )[] => {
	const translate = useTranslate();

	// list add-ons to show in UI here
	const addOnsActive = [
		{
			slug: WPCOM_FEATURES_NO_ADVERTS,
			featured: false,
			icon: noAdsIcon,
			overrides: {
				// override API-fetched metadata
				name: translate( 'Remove Ads' ),
			},
		},
		{
			slug: WPCOM_FEATURES_CUSTOM_DESIGN,
			featured: false,
			icon: customDesignIcon,
			overrides: null,
		},
		{
			slug: WPCOM_FEATURES_UNLIMITED_THEMES,
			featured: false,
			icon: unlimitedThemesIcon,
			overrides: null,
		},
	] as const;

	return useSelector( ( state ): ( AddOnMeta | null )[] => {
		return addOnsActive.map( ( addOn ) => {
			const product = getProductBySlug( state, addOn.slug );
			const name = getProductName( state, addOn.slug );
			const description = getProductDescription( state, addOn.slug );
			const displayCost = getProductDisplayCost( state, addOn.slug );
			const term = getProductTerm( state, addOn.slug );

			if ( ! product ) {
				// will not render anything if product not fetched from API
				// - can remove and update `adOnsActive` with description, name, etc. to still render
				// - probably need some sort of placeholder in the add-ons page instead
				return null;
			}

			return {
				slug: addOn.slug,
				featured: addOn.featured,
				icon: addOn.icon,
				name: addOn?.overrides?.name ?? name,
				description,
				displayCost,
				term,
			};
		} );
	} );
};

export default useAddOns;
