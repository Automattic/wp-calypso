import {
	PLAN_BUSINESS,
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	getPlan,
} from '@automattic/calypso-products';
import { englishLocales } from '@automattic/i18n-utils';
import i18n, { translate } from 'i18n-calypso';

const getIncludedWithLabel = ( planSlug ) => {
	const localeSlug = i18n.getLocaleSlug();

	const shouldShowNewString =
		( localeSlug && englishLocales.includes( i18n.getLocaleSlug() ) ) ||
		i18n.hasTranslation( 'Included with %(planName)s' );

	return shouldShowNewString
		? translate( 'Included with %(planName)s', {
				args: { planName: getPlan( planSlug )?.getTitle() },
		  } )
		: getPlan( planSlug )?.getTitle();
};

/**
 * @typedef {Object} THEME_TIERS
 * @property {Object} [tier] A theme tier mapped to UI-related properties.
 * @description This map has to be kept consistent with the theme_tier taxonomy.
 */
/**
 * @typedef {Object} tier
 * @property {string} label The translated label of the theme tier.
 * @property {string} minimumUpsellPlan The minimum plan required to activate a theme belonging to the tier. Used for upselling purposes.
 * @property {boolean} isFilterable Whether the tier can be used to filter the Theme Showcase.
 */
export const THEME_TIERS = {
	free: {
		label: translate( 'Free' ),
		minimumUpsellPlan: PLAN_FREE,
		isFilterable: true,
	},
	personal: {
		label: getIncludedWithLabel( PLAN_PERSONAL ),
		minimumUpsellPlan: PLAN_PERSONAL,
		isFilterable: true,
	},
	premium: {
		label: getIncludedWithLabel( PLAN_PREMIUM ),
		minimumUpsellPlan: PLAN_PREMIUM,
		isFilterable: true,
	},
	partner: {
		label: translate( 'Partner', {
			context: 'This theme is developed and supported by a theme partner',
		} ),
		minimumUpsellPlan: PLAN_BUSINESS,
		isFilterable: true,
	},
	woocommerce: {
		label: translate( 'WooCommerce' ),
		minimumUpsellPlan: PLAN_BUSINESS,
		isFilterable: true,
	},
	sensei: {
		label: translate( 'Sensei LMS' ),
		minimumUpsellPlan: PLAN_BUSINESS,
		isFilterable: false,
	},
	community: {
		label: translate( 'Community' ),
		minimumUpsellPlan: PLAN_BUSINESS,
		isFilterable: false,
	},
};
