import { isJetpackBackupT1Slug } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import type { WithSnakeCaseSlug } from '@automattic/calypso-products';

export default function getJetpackProductFeatures(
	product: WithSnakeCaseSlug,
	translate: ReturnType< typeof useTranslate >
): string[] {
	if ( isJetpackBackupT1Slug( product.product_slug ) ) {
		return [
			String( translate( 'Real-time cloud backups' ) ),
			String( translate( '10GB of backup storage' ) ),
			String( translate( '30-day archive & activity log' ) ),
			String( translate( 'One-click restores' ) ),
			String( translate( 'Priority support' ) ),
		];
	}

	return [];
}
