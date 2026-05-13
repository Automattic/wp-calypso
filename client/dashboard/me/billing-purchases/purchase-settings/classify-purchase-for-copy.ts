import { __ } from '@wordpress/i18n';
import { isDomainTransfer, isGoogleWorkspace, isTitanMail } from '../../../utils/purchase';
import type { Purchase } from '@automattic/api-core';

export type CancelRemoveCategory =
	| 'plan'
	| 'domain'
	| 'email'
	| 'marketplace_plugin'
	| 'marketplace_theme'
	| 'other';

export function classifyPurchaseForCopy( purchase: Purchase ): CancelRemoveCategory {
	if ( purchase.is_plan ) {
		return 'plan';
	}
	if ( purchase.is_domain_registration || isDomainTransfer( purchase ) ) {
		return 'domain';
	}
	if ( isTitanMail( purchase ) || isGoogleWorkspace( purchase ) ) {
		return 'email';
	}
	if ( purchase.product_type === 'marketplace_theme' ) {
		return 'marketplace_theme';
	}
	if (
		purchase.product_type === 'marketplace_plugin' ||
		purchase.product_type === 'saas_plugin' ||
		purchase.product_type?.startsWith( 'marketplace' )
	) {
		return 'marketplace_plugin';
	}
	return 'other';
}

/**
 * Plain-English noun for a purchase ("plan" / "domain" / "email" / "theme" /
 * "plugin" / "subscription"). Shared between the dashboard and legacy
 * cancelled-redirect notices so both surfaces produce identical copy.
 */
export function getProductNounForCategory( category: CancelRemoveCategory ): string {
	switch ( category ) {
		case 'plan':
			return __( 'plan' );
		case 'domain':
			return __( 'domain' );
		case 'email':
			return __( 'email' );
		case 'marketplace_theme':
			return __( 'theme' );
		case 'marketplace_plugin':
			return __( 'plugin' );
		default:
			return __( 'subscription' );
	}
}
