import {
	useJetpack10GbStorageAmountText,
	useJetpack1TbStorageAmountText,
	getJetpackProductDisclaimer,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { TIER_1_SLUGS, TIER_2_SLUGS } from 'calypso/my-sites/plans/jetpack-plans/constants';
import slugToSelectorProduct from 'calypso/my-sites/plans/jetpack-plans/slug-to-selector-product';
import type { ProductSlug, PlanSlug } from '@automattic/calypso-products';
import type { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';

type StorageUpgradeGetter = ( slug: string ) => SelectorProduct[];

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

export const useGetTier1UpgradeProducts = (): StorageUpgradeGetter => {
	const translate = useTranslate();

	// Security and Backup share the same per-tier storage limits
	const storageAmount = useJetpack10GbStorageAmountText();

	return useCallback(
		( slug: string ): SelectorProduct[] => {
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
			const product = slugToSelectorProduct( slug );

			return [
				{
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
				} as SelectorProduct,
			];
		},
		[ storageAmount, translate ]
	);
};

export const useGetTier2UpgradeProducts = (): StorageUpgradeGetter => {
	const translate = useTranslate();

	// Security and Backup share the same per-tier storage limits
	const storageAmount = useJetpack1TbStorageAmountText();

	return useCallback(
		( slug: string ): SelectorProduct[] => {
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
		[ storageAmount, translate ]
	);
};

const useGetStorageUpgradeProducts = () => {
	const getTier1Upgrades = useGetTier1UpgradeProducts();
	const getTier2Upgrades = useGetTier2UpgradeProducts();

	return useCallback(
		( slug: string ): SelectorProduct[] | null => {
			if ( TIER_1_SLUGS.includes( slug ) ) {
				return getTier1Upgrades( slug );
			}

			if ( TIER_2_SLUGS.includes( slug ) ) {
				return getTier2Upgrades( slug );
			}

			return null;
		},
		[ getTier1Upgrades, getTier2Upgrades ]
	);
};

export default useGetStorageUpgradeProducts;
