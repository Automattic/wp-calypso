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
	JETPACK_STATS_PRODUCTS,
	JETPACK_CREATOR_PRODUCTS,
	isJetpackCompleteSlug,
	isJetpackGrowthSlug,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { ProductDescription } from '../types';

const setProductDescription = (
	slugs: ReadonlyArray< string >,
	description: ProductDescription
): Record< string, ProductDescription > =>
	slugs.reduce( ( map, slug ) => ( { ...map, [ slug ]: description } ), {} );

export const useIncludedProductDescriptionMap = ( productSlug: string ) => {
	const translate = useTranslate();

	return useMemo( (): Record< string, ProductDescription > => {
		const backupDescription = translate(
			'Real-time backups as you edit. {{span}}30-day{{/span}} activity log archive*. Unlimited one-click restores.',
			{
				components: {
					span: <span />,
				},
			}
		);
		const backupT2Description = translate(
			'Real-time backups as you edit. {{span}}1-year{{/span}} activity log archive*. Unlimited one-click restores.',
			{
				components: {
					span: <span />,
				},
			}
		);
		const scanDescription = translate(
			'Keep your site or store ahead of security threats with automated malware scanning; including one-click fixes.'
		);
		const antiSpamDescription = translate(
			'Save time manually reviewing spam. Comment and form spam protection.'
		);
		const videoPressDescription = translate( '1TB of ad-free video hosting.' );
		const boostDescription = translate(
			'Speed up your site and improve SEO with automatic critical CSS generation.'
		);
		const searchDescription = translate( 'Powerful, instant site search.' );
		const socialDescription = translate(
			'Easily share your website content on your social media channels from one place.'
		);
		const crmDescription = translate(
			'Manage your sales funnel. Entrepreneur plan with 30 extensions.'
		);
		const statsDescription = translate( 'Simple, yet powerful stats to grow your site.' );
		const creatorDescription = translate( 'Create, grow, and monetize your audience.' );

		const INCLUDED_PRODUCT_DESCRIPTION_T1_MAP: Record< string, ProductDescription > = {
			...setProductDescription(
				[ PRODUCT_JETPACK_BACKUP_T1_YEARLY, PRODUCT_JETPACK_BACKUP_T1_MONTHLY ],
				{
					value: backupDescription,
					calloutText: translate( '10GB cloud storage' ),
				}
			),

			...setProductDescription(
				[ PRODUCT_JETPACK_BACKUP_T2_YEARLY, PRODUCT_JETPACK_BACKUP_T2_MONTHLY ],
				{ value: backupT2Description, calloutText: translate( '1TB cloud storage' ) }
			),

			...setProductDescription( JETPACK_SCAN_PRODUCTS, {
				value: scanDescription,
				calloutText: translate( 'Unlimited' ),
			} ),

			...setProductDescription( JETPACK_ANTI_SPAM_PRODUCTS, {
				value: antiSpamDescription,
				calloutText: translate( '10k API calls/mo' ),
			} ),

			...setProductDescription( JETPACK_VIDEOPRESS_PRODUCTS, { value: videoPressDescription } ),

			...setProductDescription( JETPACK_BOOST_PRODUCTS, { value: boostDescription } ),

			...setProductDescription( JETPACK_SEARCH_PRODUCTS, {
				value: searchDescription,
				calloutText: translate( '100k records & requests/mo' ),
			} ),

			...setProductDescription( JETPACK_SOCIAL_PRODUCTS, {
				value: socialDescription,
				calloutText: translate( 'Unlimited shares/mo' ),
			} ),

			...setProductDescription( JETPACK_CRM_PRODUCTS, {
				value: crmDescription,
				calloutText: translate( 'Entrepreneur plan' ),
			} ),
		};

		const INCLUDED_PRODUCT_DESCRIPTION_T2_MAP: Record< string, ProductDescription > = {
			...INCLUDED_PRODUCT_DESCRIPTION_T1_MAP,

			...setProductDescription( JETPACK_STATS_PRODUCTS, {
				value: statsDescription,
				calloutText: translate( '100k views/mo' ),
			} ),

			...setProductDescription( JETPACK_ANTI_SPAM_PRODUCTS, {
				value: antiSpamDescription,
				calloutText: translate( '60k API calls/mo' ),
			} ),

			...setProductDescription( JETPACK_CREATOR_PRODUCTS, {
				value: creatorDescription,
			} ),
		};

		const INCLUDED_PRODUCT_DESCRIPTION_GROWTH_MAP: Record< string, ProductDescription > = {
			...INCLUDED_PRODUCT_DESCRIPTION_T1_MAP,
			...INCLUDED_PRODUCT_DESCRIPTION_T2_MAP,

			// overvrite stats description
			...setProductDescription( JETPACK_STATS_PRODUCTS, {
				value: statsDescription,
				calloutText: translate( '10k views/mo' ),
			} ),
		};

		const productMap = ( () => {
			if ( isJetpackCompleteSlug( productSlug ) ) {
				return INCLUDED_PRODUCT_DESCRIPTION_T2_MAP;
			} else if ( isJetpackGrowthSlug( productSlug ) ) {
				return INCLUDED_PRODUCT_DESCRIPTION_GROWTH_MAP;
			}

			return INCLUDED_PRODUCT_DESCRIPTION_T1_MAP;
		} )();

		return productMap;
	}, [ translate, productSlug ] );
};
