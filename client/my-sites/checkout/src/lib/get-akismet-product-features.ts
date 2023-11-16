import {
	isAkismetBusiness,
	isAkismetBusiness5k,
	isAkismetPersonal,
	isAkismetPro,
	isAkismetPro5h,
	isAkismetFree,
	isAkismetEnterprise,
	isAkismetPlus10k,
	isAkismetPlus20k,
	isAkismetPlus30k,
	isAkismetPlus40k,
	isAkismetEnterprise15k,
	isAkismetEnterprise25k,
	isAkismetEnterprise350k,
	isAkismetEnterprise2m,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import type { WithSnakeCaseSlug } from '@automattic/calypso-products';

type productString =
	| 'free'
	| 'personal'
	| 'pro_5h'
	| 'pro_10k'
	| 'pro_20k'
	| 'pro_30k'
	| 'pro_40k'
	| 'business'
	| 'business_5k'
	| 'enterprise_15k'
	| 'enterprise_25k'
	| 'enterprise_350k'
	| 'enterprise_2m';

function getFeatureStrings(
	product: productString,
	translate: ReturnType< typeof useTranslate >
): string[] {
	const baseFeatures = [ translate( 'Comment and form spam protection' ) ];
	const baseProFeatures = [ translate( 'Flexible API' ), translate( 'Product support' ) ];
	const baseEnterpriseFeatures = [
		translate( 'Flexible API' ),
		translate( 'Unlimited sites' ),
		translate( 'Priority support' ),
	];

	switch ( product ) {
		case 'free':
			return [ ...baseFeatures ];
		case 'personal':
			return [ ...baseFeatures ];
		case 'pro_5h':
			return [ ...baseFeatures, translate( '500 API calls per month' ), ...baseProFeatures ];
		case 'pro_10k':
			return [ ...baseFeatures, translate( '10K API calls per month' ), ...baseProFeatures ];
		case 'pro_20k':
			return [ ...baseFeatures, translate( '20K API calls per month' ), ...baseProFeatures ];
		case 'pro_30k':
			return [ ...baseFeatures, translate( '30K API calls per month' ), ...baseProFeatures ];
		case 'pro_40k':
			return [ ...baseFeatures, translate( '40K API calls per month' ), ...baseProFeatures ];
		case 'business':
			return [ ...baseFeatures, translate( '60K API calls per month' ), ...baseEnterpriseFeatures ];
		case 'business_5k':
			return [ ...baseFeatures, translate( '5K API calls per month' ), ...baseEnterpriseFeatures ];
		case 'enterprise_15k':
			return [ ...baseFeatures, translate( '15K API calls per month' ), ...baseEnterpriseFeatures ];
		case 'enterprise_25k':
			return [ ...baseFeatures, translate( '25K API calls per month' ), ...baseEnterpriseFeatures ];
		case 'enterprise_350k':
			return [
				...baseFeatures,
				translate( '350K API calls per month' ),
				...baseEnterpriseFeatures,
			];
		case 'enterprise_2m':
			return [ ...baseFeatures, translate( '2M API calls per month' ), ...baseEnterpriseFeatures ];
		default:
			return [];
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
		if ( isAkismetPlus10k( product ) ) {
			return getFeatureStrings( 'pro_10k', translate );
		}
		if ( isAkismetPlus20k( product ) ) {
			return getFeatureStrings( 'pro_20k', translate );
		}
		if ( isAkismetPlus30k( product ) ) {
			return getFeatureStrings( 'pro_30k', translate );
		}
		if ( isAkismetPlus40k( product ) ) {
			return getFeatureStrings( 'pro_40k', translate );
		}
		if ( isAkismetPro5h( product ) ) {
			return getFeatureStrings( 'pro_5h', translate );
		}
	}

	if ( isAkismetBusiness( product ) ) {
		if ( isAkismetBusiness5k( product ) ) {
			return getFeatureStrings( 'business_5k', translate );
		}

		return getFeatureStrings( 'business', translate );
	}

	if ( isAkismetEnterprise( product ) ) {
		if ( isAkismetEnterprise15k( product ) ) {
			return getFeatureStrings( 'enterprise_15k', translate );
		}

		if ( isAkismetEnterprise25k( product ) ) {
			return getFeatureStrings( 'enterprise_25k', translate );
		}

		if ( isAkismetEnterprise350k( product ) ) {
			return getFeatureStrings( 'enterprise_350k', translate );
		}

		if ( isAkismetEnterprise2m( product ) ) {
			return getFeatureStrings( 'enterprise_2m', translate );
		}
	}

	return [];
}
