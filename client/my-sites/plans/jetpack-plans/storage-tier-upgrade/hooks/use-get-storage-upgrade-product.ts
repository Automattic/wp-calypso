import {
	useJetpack10GbStorageAmountText,
	useJetpack1TbStorageAmountText,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { TIER_1_SLUGS, TIER_2_SLUGS } from 'calypso/my-sites/plans/jetpack-plans/constants';
import slugToSelectorProduct from 'calypso/my-sites/plans/jetpack-plans/slug-to-selector-product';
import type { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';

type StorageUpgradeGetter = ( slug: string ) => SelectorProduct;

export const useGetTier1UpgradeProduct = (): StorageUpgradeGetter => {
	const translate = useTranslate();

	// Security and Backup share the same per-tier storage limits
	const storageAmount = useJetpack10GbStorageAmountText();

	return useCallback(
		( slug: string ): SelectorProduct =>
			( {
				...slugToSelectorProduct( slug ),
				displayName: storageAmount,
				subheader: translate( 'of backup storage' ),
				buttonLabel: translate( 'Upgrade storage' ),
				// description: <the default description of the product being upgraded>,
				features: {
					items: [
						{
							text: translate( '%(storageAmount)s backup storage', { args: { storageAmount } } ),
						},
						{
							text: translate( 'One-click restore from the last 30 days of backups' ),
						},
						{
							text: translate( '30-day activity log' ),
						},
						{
							text: translate( 'Real-time backups (as you edit)' ),
						},
						{
							text: translate( 'Backups are cloud based and secure' ),
						},
					],
				},
			} as SelectorProduct ),
		[ storageAmount, translate ]
	);
};

export const useGetTier2UpgradeProduct = (): StorageUpgradeGetter => {
	const translate = useTranslate();

	// Security and Backup share the same per-tier storage limits
	const storageAmount = useJetpack1TbStorageAmountText();

	return useCallback(
		( slug: string ): SelectorProduct =>
			( {
				...slugToSelectorProduct( slug ),
				displayName: storageAmount,
				subheader: translate( 'of backup storage' ),
				buttonLabel: translate( 'Upgrade storage' ),
				description: translate(
					'Go back in time and recover all your information for up to a year, with %(storageAmount)s storage space.',
					{ args: { storageAmount } }
				),
				features: {
					items: [
						{
							text: translate( '%(storageAmount)s backup storage', { args: { storageAmount } } ),
							isHighlighted: true,
						},
						{
							text: translate( 'One-click restore from the past year of backups' ),
							isHighlighted: true,
						},
						{
							text: translate( 'One year activity log' ),
							isHighlighted: true,
						},
						{
							text: translate( 'Real-time backups (as you edit)' ),
						},
						{
							text: translate( 'Backups are cloud based and secure' ),
						},
					],
				},
			} as SelectorProduct ),
		[ storageAmount, translate ]
	);
};

const useGetStorageUpgradeProduct = () => {
	const getTier1Upgrade = useGetTier1UpgradeProduct();
	const getTier2Upgrade = useGetTier2UpgradeProduct();

	return useCallback(
		( slug: string ): SelectorProduct | null => {
			if ( TIER_1_SLUGS.includes( slug ) ) {
				return getTier1Upgrade( slug );
			}

			if ( TIER_2_SLUGS.includes( slug ) ) {
				return getTier2Upgrade( slug );
			}

			return null;
		},
		[ getTier1Upgrade, getTier2Upgrade ]
	);
};

export default useGetStorageUpgradeProduct;
