import {
	PRODUCT_JETPACK_BACKUP_T0_YEARLY,
	PRODUCT_JETPACK_BACKUP_T0_MONTHLY,
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
	JETPACK_STARTER_PLANS,
	JETPACK_COMPLETE_PLANS,
} from '@automattic/calypso-products';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';

const setTranslation = ( slugs: ReadonlyArray< string >, value: TranslateResult ) =>
	slugs.reduce( ( map, slug ) => ( { ...map, [ slug ]: value } ), {} );

export const useIncludedProductDescriptionMap = ( productSlug: string ) => {
	const translate = useTranslate();

	return useMemo( () => {
		const INCLUDED_PRODUCT_DESCRIPTION_T0_MAP: Record< string, string > = {
			...setTranslation(
				[ PRODUCT_JETPACK_BACKUP_T0_YEARLY, PRODUCT_JETPACK_BACKUP_T0_MONTHLY ],
				translate(
					'Real-time backups as you edit. 1GB of cloud storage. {{span}}30-day{{/span}} activity log archive. Unlimited one-click restores.',
					{
						components: {
							span: <span />,
						},
					}
				)
			),

			...setTranslation(
				JETPACK_ANTI_SPAM_PRODUCTS,
				translate(
					'Save time manually reviewing spam. Comment and form spam protection (1k API calls/mo).'
				)
			),
		};

		const INCLUDED_PRODUCT_DESCRIPTION_T1_MAP: Record< string, TranslateResult > = {
			...setTranslation(
				[ PRODUCT_JETPACK_BACKUP_T1_YEARLY, PRODUCT_JETPACK_BACKUP_T1_MONTHLY ],
				translate(
					'Real-time backups as you edit. 10GB of cloud storage. {{span}}30-day{{/span}} activity log archive*. Unlimited one-click restores.',
					{
						components: {
							span: <span />,
						},
					}
				)
			),

			...setTranslation(
				[ PRODUCT_JETPACK_BACKUP_T2_YEARLY, PRODUCT_JETPACK_BACKUP_T2_MONTHLY ],
				translate(
					'Unlimited restores from the last 1 year, 1TB (1,000GB) of cloud storage & {{span}}1-year{{/span}} activity log archive.',
					{
						components: {
							span: <span />,
						},
					}
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

			...setTranslation(
				JETPACK_VIDEOPRESS_PRODUCTS,
				translate( '1TB of ad-free video hosting.' )
			),

			...setTranslation(
				JETPACK_BOOST_PRODUCTS,
				translate( 'Speed up your site and improve SEO with automatic critical CSS generation.' )
			),

			...setTranslation(
				JETPACK_SEARCH_PRODUCTS,
				translate( 'Lightning-fast search up to 100k records and 100k requests/mo.' )
			),

			...setTranslation(
				JETPACK_SOCIAL_PRODUCTS,
				translate( 'Engage your social followers. Advanced plan with unlimited shares.' )
			),

			...setTranslation(
				JETPACK_CRM_PRODUCTS,
				translate( 'Manage your sales funnel. Entrepreneur plan with 30 extensions.' )
			),
		};

		const INCLUDED_PRODUCT_DESCRIPTION_T2_MAP: Record< string, string > = {
			...INCLUDED_PRODUCT_DESCRIPTION_T1_MAP,

			...setTranslation(
				JETPACK_ANTI_SPAM_PRODUCTS,
				translate( 'Comment and form spam protection (60k API calls/mo).' )
			),
		};

		const productMap = ( () => {
			const isJetpackStarterPlan = ( JETPACK_STARTER_PLANS as ReadonlyArray< string > ).includes(
				productSlug
			);
			const isJetpackCompletePlan = ( JETPACK_COMPLETE_PLANS as ReadonlyArray< string > ).includes(
				productSlug
			);

			if ( isJetpackStarterPlan ) {
				return INCLUDED_PRODUCT_DESCRIPTION_T0_MAP;
			}

			if ( isJetpackCompletePlan ) {
				return INCLUDED_PRODUCT_DESCRIPTION_T2_MAP;
			}

			return INCLUDED_PRODUCT_DESCRIPTION_T1_MAP;
		} )();

		return productMap;
	}, [ translate, productSlug ] );
};
