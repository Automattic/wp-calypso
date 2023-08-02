import {
	useJetpackStorageAmountTextByProductSlug,
	getJetpackProductDisclaimer,
	ProductSlug,
	PlanSlug,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_3TB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_5TB_MONTHLY,
	JETPACK_BACKUP_ADDON_PRODUCTS,
	PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PRODUCT_JETPACK_BACKUP_T2_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T2_YEARLY,
	PLAN_JETPACK_SECURITY_T1_MONTHLY,
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PLAN_JETPACK_SECURITY_T2_MONTHLY,
	PLAN_JETPACK_SECURITY_T2_YEARLY,
} from '@automattic/calypso-products';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import slugToSelectorProduct from 'calypso/my-sites/plans/jetpack-plans/slug-to-selector-product';
import type { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';

type StorageUpgradeGetter = ( slug: string, isPurchased: boolean ) => SelectorProduct;

// E.g. 30-day activity log
const MONTHLY_FEATURES_PRODUCTS = [
	PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PLAN_JETPACK_SECURITY_T1_MONTHLY,
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_MONTHLY,
];

// E.g.	one year activity log
const YEARLY_FEATURES_PRODUCTS = [
	PRODUCT_JETPACK_BACKUP_T2_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T2_YEARLY,
	PLAN_JETPACK_SECURITY_T2_MONTHLY,
	PLAN_JETPACK_SECURITY_T2_YEARLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_3TB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_5TB_MONTHLY,
];

const getDisclaimerLink = (): string => {
	const backupStorageFaqId = 'backup-storage-limits-faq';

	// Check to see if FAQ is on the current page
	// This is so we can anchor link to it instead of opening a new window if it is on the page already
	const backupStorageFaq = document.getElementById( backupStorageFaqId );

	if ( backupStorageFaq ) {
		return `#${ backupStorageFaqId }`;
	}

	if ( isJetpackCloud() ) {
		return `/pricing#${ backupStorageFaqId }`;
	}

	return `https://cloud.jetpack.com/pricing#${ backupStorageFaqId }`;
};

const getDisclaimer = (
	slug: string,
	features: Array< { text: TranslateResult; slug: string } >
) => {
	return getJetpackProductDisclaimer(
		slug as ProductSlug | PlanSlug,
		features,
		getDisclaimerLink()
	);
};

const useGetSharedCardData = () => {
	const translate = useTranslate();

	return useCallback(
		( slug: string ) => ( {
			subheader: translate( 'of backup storage' ),
			buttonLabel: ( JETPACK_BACKUP_ADDON_PRODUCTS as ReadonlyArray< string > ).includes( slug )
				? translate( 'Get add-on' )
				: translate( 'Upgrade storage' ),
			// description: <the default description of the product being upgraded>,
			features: [
				{
					text: translate( 'Real-time backups (as you edit)' ),
					slug: 'jetpack-real-time-backups',
				},
				{
					text: translate( 'Backups are cloud based and secure' ),
					slug: 'jetpack-cloud-backups',
				},
			],
		} ),
		[ translate ]
	);
};

export const useGetMonthlyBackupsCardData = (): StorageUpgradeGetter => {
	const translate = useTranslate();
	const getSharedCardData = useGetSharedCardData();
	const getAmountBySlug = useJetpackStorageAmountTextByProductSlug();

	return useCallback(
		( slug, isPurchased ): SelectorProduct => {
			const product = slugToSelectorProduct( slug );
			const storageAmount = getAmountBySlug( slug );
			const { subheader, buttonLabel, features: sharedFeatures } = getSharedCardData( slug );
			const features = {
				items: [
					{
						text: translate( '%(storageAmount)s backup storage', {
							args: { storageAmount: storageAmount as string },
						} ),
						slug: 'jetpack-backup-storage',
					},
					{
						text: translate( 'One-click restore from the last 30 days of backups' ),
						slug: 'jetpack-one-click-restore',
					},
					{
						text: translate( '30-day activity log*' ),
						slug: 'jetpack-30-day-archive-activity-log',
					},
					...sharedFeatures,
				],
			};

			// Upgrade from Backup T1 to Backup add-on instead of the yearly term is enforced in
			// the checkout page. This is a temporary solution to disable yearly upgrades
			// altogether, as add-ons do eithern't have yearly terms.
			if ( isPurchased && product ) {
				product.forceNoYearlyUpgrade = true;
			}

			return {
				...product,
				displayName: JETPACK_BACKUP_ADDON_PRODUCTS.includes(
					slug as ( typeof JETPACK_BACKUP_ADDON_PRODUCTS )[ number ]
				)
					? storageAmount
					: product?.displayName,
				subheader: isPurchased ? '' : subheader,
				buttonLabel,
				features: features,
				disclaimer: getDisclaimer( product?.productSlug as string, features.items ),
			} as SelectorProduct;
		},
		[ getAmountBySlug, getSharedCardData, translate ]
	);
};

export const useGetYearlyBackupsCardData = (): StorageUpgradeGetter => {
	const translate = useTranslate();
	const getSharedCardData = useGetSharedCardData();
	const getAmountBySlug = useJetpackStorageAmountTextByProductSlug();

	return useCallback(
		( slug: string, isPurchased ): SelectorProduct => {
			const product = slugToSelectorProduct( slug );
			const storageAmount = getAmountBySlug( slug );
			const { subheader, buttonLabel, features: sharedFeatures } = getSharedCardData( slug );
			const features = {
				items: [
					{
						text: translate( '%(storageAmount)s backup storage', {
							args: { storageAmount: storageAmount as string },
						} ),
						slug: 'jetpack-backup-storage',
						isHighlighted: true,
					},
					{
						text: translate( 'One-click restore from the past year of backups' ),
						slug: 'jetpack-one-click-restore',
						isHighlighted: true,
					},
					{
						text: translate( 'One year activity log*' ),
						slug: 'jetpack-1-year-archive-activity-log',
						isHighlighted: true,
					},
					...sharedFeatures,
				],
			};

			// Upgrade from Backup T1 to Backup add-on instead of the yearly term is enforced in
			// the checkout page. This is a temporary solution to disable yearly upgrades
			// altogether, as add-ons do eithern't have yearly terms.
			if ( isPurchased && product ) {
				product.forceNoYearlyUpgrade = true;
			}

			return {
				...product,
				displayName: JETPACK_BACKUP_ADDON_PRODUCTS.includes(
					slug as ( typeof JETPACK_BACKUP_ADDON_PRODUCTS )[ number ]
				)
					? storageAmount
					: product?.displayName,
				subheader: isPurchased ? '' : subheader,
				buttonLabel,
				description: translate(
					'Go back in time and recover all your information for up to a year, with %(storageAmount)s storage space.',
					{ args: { storageAmount: storageAmount as string } }
				),
				features,
				disclaimer: getDisclaimer( product?.productSlug as string, features.items ),
			} as SelectorProduct;
		},
		[ getAmountBySlug, getSharedCardData, translate ]
	);
};

const useGetProductCardData = () => {
	const getMonthlyBackupsCardData = useGetMonthlyBackupsCardData();
	const getYearlyBackupsCardData = useGetYearlyBackupsCardData();

	return useCallback(
		( slug: string, isPurchased: boolean ): SelectorProduct | null => {
			if ( MONTHLY_FEATURES_PRODUCTS.includes( slug ) ) {
				return getMonthlyBackupsCardData( slug, isPurchased );
			}

			if ( YEARLY_FEATURES_PRODUCTS.includes( slug ) ) {
				return getYearlyBackupsCardData( slug, isPurchased );
			}

			return null;
		},
		[ getMonthlyBackupsCardData, getYearlyBackupsCardData ]
	);
};

export default useGetProductCardData;
