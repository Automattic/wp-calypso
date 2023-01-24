import { isJetpackBackupT1, isJetpackBackupT2 } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from '@automattic/calypso-products';

export default function getJetpackProductFeatures(
	product: WithSnakeCaseSlug | WithCamelCaseSlug,
	translate: ReturnType< typeof useTranslate >
): string[] {
	if ( isJetpackBackupT1( product ) ) {
		return [
			String( translate( 'Real-time cloud backups' ) ),
			String( translate( '10GB of backup storage' ) ),
			String( translate( '30-day archive & activity log' ) ),
			String( translate( 'One-click restores' ) ),
			String( translate( 'Priority support' ) ),
		];
	}

	if ( isJetpackBackupT2( product ) ) {
		return [
			String( translate( 'Real-time cloud backups' ) ),
			String( translate( '1TB of backup storage' ) ),
			String( translate( '1 year archive & activity log' ) ),
			String( translate( 'One-click restores' ) ),
			String( translate( 'Priority support' ) ),
		];
	}

	return [];
}
