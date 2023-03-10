import {
	useJetpackStorageAmountTextByProductSlug,
	getJetpackProductDisclaimer,
	ProductSlug,
	PlanSlug,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_YEARLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_YEARLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_3TB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_3TB_YEARLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_5TB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_5TB_YEARLY,
	PLAN_JETPACK_SECURITY_T2_MONTHLY,
	PLAN_JETPACK_SECURITY_T2_YEARLY,
	isJetpackBackupSlug,
	isJetpackSecuritySlug,
	TERM_MONTHLY,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { TIER_1_SLUGS, TIER_2_SLUGS } from 'calypso/my-sites/plans/jetpack-plans/constants';
import slugToSelectorProduct from 'calypso/my-sites/plans/jetpack-plans/slug-to-selector-product';
import type { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';

type StorageUpgradeGetter = ( slug: string ) => SelectorProduct[];

const BACKUP_T1_MONTHLY_UPGRADES = [
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_MONTHLY,
];

const BACKUP_T1_YEARLY_UPGRADES = [
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_YEARLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_YEARLY,
];

const BACKUP_T2_MONTHLY_UPGRADES = [
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_3TB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_5TB_MONTHLY,
];

const BACKUP_T2_YEARLY_UPGRADES = [
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_3TB_YEARLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_5TB_YEARLY,
];

const SECURITY_T1_MONTHLY_UPGRADES = [ PLAN_JETPACK_SECURITY_T2_MONTHLY ];

const SECURITY_T1_YEARLY_UPGRADES = [ PLAN_JETPACK_SECURITY_T2_YEARLY ];

function getDisclaimerLink() {
	const backupStorageFaqId = 'backup-storage-limits-faq';

	const urlParams = new URLSearchParams( window.location.search );
	const calypsoEnv = urlParams.get( 'calypso_env' );
	// Check to see if FAQ is on the current page
	// This is so we can anchor link to it instead of opening a new window if it is on the page already
	const backupStorageFaq = document.getElementById( backupStorageFaqId );

	if ( backupStorageFaq ) {
		return `#${ backupStorageFaqId }`;
	}

	return calypsoEnv === 'development'
		? `http://jetpack.cloud.localhost:3000/pricing#${ backupStorageFaqId }`
		: `https://cloud.jetpack.com/pricing#${ backupStorageFaqId }`;
}

export const useGetBackupTier1UpgradeProducts = (): StorageUpgradeGetter => {
	const translate = useTranslate();
	const getAmountBySlug = useJetpackStorageAmountTextByProductSlug();

	return useCallback(
		( slug ): SelectorProduct[] => {
			const product = slugToSelectorProduct( slug );
			const term = product?.term;
			const upgrades =
				term === TERM_MONTHLY ? BACKUP_T1_MONTHLY_UPGRADES : BACKUP_T1_YEARLY_UPGRADES;

			return upgrades.map( ( slug ) => {
				const product = slugToSelectorProduct( slug );
				const storageAmount = getAmountBySlug( slug );
				const features = {
					items: [
						{
							text: translate( '%(storageAmount)s backup storage', { args: { storageAmount } } ),
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
						{
							text: translate( 'Real-time backups (as you edit)' ),
							slug: 'jetpack-real-time-backups',
						},
						{
							text: translate( 'Backups are cloud based and secure' ),
							slug: 'jetpack-cloud-backups',
						},
					],
				};

				return {
					...product,
					displayName: storageAmount,
					subheader: translate( 'of backup storage' ),
					buttonLabel: translate( 'Upgrade storage' ),
					// description: <the default description of the product being upgraded>,
					features: features,
					disclaimer: getJetpackProductDisclaimer(
						product?.productSlug as ProductSlug | PlanSlug,
						features.items,
						getDisclaimerLink()
					),
				} as SelectorProduct;
			} );
		},
		[ getAmountBySlug, translate ]
	);
};

export const useGetSecurityTier1UpgradeProducts = (): StorageUpgradeGetter => {
	const translate = useTranslate();
	const getAmountBySlug = useJetpackStorageAmountTextByProductSlug();

	return useCallback(
		( slug: string ): SelectorProduct[] => {
			const product = slugToSelectorProduct( slug );
			const term = product?.term;
			const upgrades =
				term === TERM_MONTHLY ? SECURITY_T1_MONTHLY_UPGRADES : SECURITY_T1_YEARLY_UPGRADES;

			return upgrades.map( ( slug ) => {
				const storageAmount = getAmountBySlug( slug );
				const features = {
					items: [
						{
							text: translate( '%(storageAmount)s backup storage', { args: { storageAmount } } ),
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
						{
							text: translate( 'Real-time backups (as you edit)' ),
							slug: 'jetpack-real-time-backups',
						},
						{
							text: translate( 'Backups are cloud based and secure' ),
							slug: 'jetpack-cloud-backups',
						},
					],
				};
				const product = slugToSelectorProduct( slug );

				return {
					...product,
					displayName: storageAmount,
					subheader: translate( 'of backup storage' ),
					buttonLabel: translate( 'Upgrade storage' ),
					description: translate(
						'Go back in time and recover all your information for up to a year, with %(storageAmount)s storage space.',
						{ args: { storageAmount } }
					),
					features: features,
					disclaimer: getJetpackProductDisclaimer(
						product?.productSlug as ProductSlug | PlanSlug,
						features.items,
						getDisclaimerLink()
					),
				} as SelectorProduct;
			} );
		},
		[ getAmountBySlug, translate ]
	);
};

export const useGetBackupTier2UpgradeProducts = (): StorageUpgradeGetter => {
	const translate = useTranslate();
	const getAmountBySlug = useJetpackStorageAmountTextByProductSlug();

	return useCallback(
		( slug ): SelectorProduct[] => {
			const product = slugToSelectorProduct( slug );
			const term = product?.term;
			const upgrades =
				term === TERM_MONTHLY ? BACKUP_T2_MONTHLY_UPGRADES : BACKUP_T2_YEARLY_UPGRADES;

			return upgrades.map( ( slug ) => {
				const product = slugToSelectorProduct( slug );
				const storageAmount = getAmountBySlug( slug );
				const features = {
					items: [
						{
							text: translate( '%(storageAmount)s backup storage', { args: { storageAmount } } ),
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
						{
							text: translate( 'Real-time backups (as you edit)' ),
							slug: 'jetpack-real-time-backups',
						},
						{
							text: translate( 'Backups are cloud based and secure' ),
							slug: 'jetpack-cloud-backups',
						},
					],
				};

				return {
					...product,
					displayName: storageAmount,
					subheader: translate( 'of backup storage' ),
					buttonLabel: translate( 'Upgrade storage' ),
					description: translate(
						'Go back in time and recover all your information for up to a year, with %(storageAmount)s storage space.',
						{ args: { storageAmount } }
					),
					features: features,
					disclaimer: getJetpackProductDisclaimer(
						product?.productSlug as ProductSlug | PlanSlug,
						features.items,
						getDisclaimerLink()
					),
				} as SelectorProduct;
			} );
		},
		[ getAmountBySlug, translate ]
	);
};

export const useGetSecurityTier2UpgradeProducts = (): StorageUpgradeGetter => {
	const translate = useTranslate();
	const getAmountBySlug = useJetpackStorageAmountTextByProductSlug();

	return useCallback(
		( slug: string ): SelectorProduct[] => {
			const storageAmount = getAmountBySlug( slug );
			const features = {
				items: [
					{
						text: translate( '%(storageAmount)s backup storage', { args: { storageAmount } } ),
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
					{
						text: translate( 'Real-time backups (as you edit)' ),
						slug: 'jetpack-real-time-backups',
					},
					{
						text: translate( 'Backups are cloud based and secure' ),
						slug: 'jetpack-cloud-backups',
					},
				],
			};
			const product = slugToSelectorProduct( slug );

			return [
				{
					...product,
					displayName: storageAmount,
					subheader: translate( 'of backup storage' ),
					buttonLabel: translate( 'Upgrade storage' ),
					description: translate(
						'Go back in time and recover all your information for up to a year, with %(storageAmount)s storage space.',
						{ args: { storageAmount } }
					),
					features: features,
					disclaimer: getJetpackProductDisclaimer(
						product?.productSlug as ProductSlug | PlanSlug,
						features.items,
						getDisclaimerLink()
					),
				} as SelectorProduct,
			];
		},
		[ getAmountBySlug, translate ]
	);
};

const useGetStorageUpgradeProducts = () => {
	const getBackupTier1Upgrades = useGetBackupTier1UpgradeProducts();
	const getSecurityTier1Upgrades = useGetSecurityTier1UpgradeProducts();
	const getBackupTier2Upgrades = useGetBackupTier2UpgradeProducts();
	const getSecurityTier2Upgrades = useGetSecurityTier2UpgradeProducts();

	return useCallback(
		( slug: string ): SelectorProduct[] | null => {
			if ( TIER_1_SLUGS.includes( slug ) ) {
				if ( isJetpackBackupSlug( slug ) ) {
					return getBackupTier1Upgrades( slug );
				} else if ( isJetpackSecuritySlug( slug ) ) {
					return getSecurityTier1Upgrades( slug );
				}

				return [];
			}

			if ( TIER_2_SLUGS.includes( slug ) ) {
				if ( isJetpackBackupSlug( slug ) ) {
					return getBackupTier2Upgrades( slug );
				} else if ( isJetpackSecuritySlug( slug ) ) {
					return getSecurityTier2Upgrades( slug );
				}

				return [];
			}

			return [];
		},
		[
			getBackupTier1Upgrades,
			getSecurityTier1Upgrades,
			getBackupTier2Upgrades,
			getSecurityTier2Upgrades,
		]
	);
};

export default useGetStorageUpgradeProducts;
