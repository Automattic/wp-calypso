import {
	isAkismetBusiness,
	isAkismetPersonal,
	isAkismetPro,
	isAkismetFree,
	PRODUCT_AKISMET_PLUS_MONTHLY,
	PRODUCT_AKISMET_PLUS_20K_MONTHLY,
	PRODUCT_AKISMET_PLUS_30K_MONTHLY,
	PRODUCT_AKISMET_PLUS_40K_MONTHLY,
	PRODUCT_AKISMET_PLUS_YEARLY,
	PRODUCT_AKISMET_PLUS_20K_YEARLY,
	PRODUCT_AKISMET_PLUS_30K_YEARLY,
	PRODUCT_AKISMET_PLUS_40K_YEARLY,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import type { WithSnakeCaseSlug } from '@automattic/calypso-products';

type productString =
	| 'free'
	| 'personal'
	| 'pro_10k'
	| 'pro_20k'
	| 'pro_30k'
	| 'pro_40k'
	| 'business';

function getFeatureStrings(
	product: productString,
	translate: ReturnType< typeof useTranslate >
): string[] {
	const baseFeatures = [ translate( 'Comment and form spam protection' ) ];
	const baseProFeatures = [ translate( 'Flexible API' ), translate( 'Product support' ) ];

	switch ( product ) {
		case 'free':
			return [ ...baseFeatures ];
		case 'personal':
			return [ ...baseFeatures ];
		case 'pro_10k':
			return [ ...baseFeatures, translate( '10K API calls per month' ), ...baseProFeatures ];
		case 'pro_20k':
			return [ ...baseFeatures, translate( '20K API calls per month' ), ...baseProFeatures ];
		case 'pro_30k':
			return [ ...baseFeatures, translate( '30K API calls per month' ), ...baseProFeatures ];
		case 'pro_40k':
			return [ ...baseFeatures, translate( '40K API calls per month' ), ...baseProFeatures ];
		case 'business':
			return [
				...baseFeatures,
				translate( 'Flexible API' ),
				translate( '60K API calls per month' ),
				translate( 'Unlimited sites' ),
				translate( 'Priority support' ),
			];
	}
}

export default function getAkismetProductFeatures(
	product: WithSnakeCaseSlug,
	translate: ReturnType< typeof useTranslate >
): string[] {
	if ( isAkismetFree( product ) ) {
		return getFeatureStrings( 'free', translate );
	}

	if ( isAkismetPersonal( product ) ) {
		return getFeatureStrings( 'personal', translate );
	}

	if ( isAkismetPro( product ) ) {
		const productSlug = product.product_slug;
		if (
			productSlug === PRODUCT_AKISMET_PLUS_MONTHLY ||
			productSlug === PRODUCT_AKISMET_PLUS_YEARLY
		) {
			return getFeatureStrings( 'pro_10k', translate );
		}
		if (
			productSlug === PRODUCT_AKISMET_PLUS_20K_MONTHLY ||
			productSlug === PRODUCT_AKISMET_PLUS_20K_YEARLY
		) {
			return getFeatureStrings( 'pro_20k', translate );
		}
		if (
			productSlug === PRODUCT_AKISMET_PLUS_30K_MONTHLY ||
			productSlug === PRODUCT_AKISMET_PLUS_30K_YEARLY
		) {
			return getFeatureStrings( 'pro_30k', translate );
		}
		if (
			productSlug === PRODUCT_AKISMET_PLUS_40K_MONTHLY ||
			productSlug === PRODUCT_AKISMET_PLUS_40K_YEARLY
		) {
			return getFeatureStrings( 'pro_40k', translate );
		}
	}

	if ( isAkismetBusiness( product ) ) {
		return getFeatureStrings( 'business', translate );
	}

	return [];
}
