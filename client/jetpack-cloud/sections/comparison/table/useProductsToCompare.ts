import {
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_FREE,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { ProductToCompare } from '../types';

export const useProductsToCompare = () => {
	const translate = useTranslate();

	return useMemo< Array< ProductToCompare > >(
		() => [
			{
				id: 'FREE',
				name: translate( 'Free' ),
				productSlug: PLAN_JETPACK_FREE,
			},
			{
				id: 'BACKUP',
				name: translate( 'VaultPress Backup' ),
				productSlug: PRODUCT_JETPACK_BACKUP_T1_YEARLY,
			},
			{
				id: 'SECURITY',
				name: translate( 'Security', { context: 'Jetpack product name' } ),
				productSlug: PLAN_JETPACK_SECURITY_T1_YEARLY,
			},
			{
				id: 'COMPLETE',
				name: translate( 'Complete', { context: 'Jetpack plan name' } ),
				productSlug: PLAN_JETPACK_COMPLETE,
			},
		],
		[ translate ]
	);
};
