import {
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T2_YEARLY,
	PRODUCT_JETPACK_BACKUP_T2_MONTHLY,
	JETPACK_SCAN_PRODUCTS,
	JETPACK_ANTI_SPAM_PRODUCTS,
	JETPACK_VIDEOPRESS_PRODUCTS,
	JETPACK_BOOST_PRODUCTS,
	JETPACK_SEARCH_PRODUCTS,
	JETPACK_SOCIAL_PRODUCTS,
	JETPACK_CRM_PRODUCTS,
	JETPACK_COMPLETE_PLANS,
} from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';

const setTranslation = ( slugs: ReadonlyArray< string >, value: string ) =>
	slugs.reduce( ( map, slug ) => ( { ...map, [ slug ]: value } ), {} );

export const INCLUDED_PRODUCT_DESCRIPTION_T1_MAP: Record< string, string > = {
	...setTranslation(
		[ PRODUCT_JETPACK_BACKUP_T1_YEARLY, PRODUCT_JETPACK_BACKUP_T1_MONTHLY ],
		translate(
			'Real-time backups as you edit. 10GB of cloud storage. 30-day activity log archive. Unlimited one-click restores.'
		)
	),

	...setTranslation(
		[ PRODUCT_JETPACK_BACKUP_T2_YEARLY, PRODUCT_JETPACK_BACKUP_T2_MONTHLY ],
		translate(
			'Unlimited restores from the last 1 year, 1TB (1,000GB) of cloud storage & 1-year activity log archive.'
		)
	),

	...setTranslation(
		JETPACK_SCAN_PRODUCTS,
		translate( 'Real-time malware scanning and one-click fixes.' )
	),

	...setTranslation(
		JETPACK_ANTI_SPAM_PRODUCTS,
		translate(
			'Save time manually reviewing spam. Comment and form spam protection (10k API calls/mo).'
		)
	),

	...setTranslation( JETPACK_VIDEOPRESS_PRODUCTS, translate( '1TB of ad-free video hosting.' ) ),

	...setTranslation( JETPACK_BOOST_PRODUCTS, translate( 'Automatic CSS generation.' ) ),

	...setTranslation(
		JETPACK_SEARCH_PRODUCTS,
		translate( 'Lightning-fast search up to 100k records.' )
	),

	...setTranslation(
		JETPACK_SOCIAL_PRODUCTS,
		translate( 'Engage your social followers. Basic plan with 1,000 shares/mo.' )
	),

	...setTranslation(
		JETPACK_CRM_PRODUCTS,
		translate( 'Manage your sales funnel. Entrepreneur plan with 30 extensions.' )
	),
};

export const INCLUDED_PRODUCT_DESCRIPTION_T2_MAP: Record< string, string > = {
	...INCLUDED_PRODUCT_DESCRIPTION_T1_MAP,

	...setTranslation(
		JETPACK_ANTI_SPAM_PRODUCTS,
		translate( 'Comment and form spam protection (60k API calls/mo).' )
	),
};

const getIncludedProductDescriptionMap = ( productSlug: string ): Record< string, string > => {
	const isJetpackCompletePlan = ( JETPACK_COMPLETE_PLANS as ReadonlyArray< string > ).includes(
		productSlug
	);
	return isJetpackCompletePlan
		? INCLUDED_PRODUCT_DESCRIPTION_T2_MAP
		: INCLUDED_PRODUCT_DESCRIPTION_T1_MAP;
};

export default getIncludedProductDescriptionMap;
