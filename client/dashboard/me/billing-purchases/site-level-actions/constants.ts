import { __ } from '@wordpress/i18n';
import type { Purchase } from '@automattic/api-core';

export type SiteAction = 'renew' | 'cancel' | 'remove' | 'auto-renew';

export const SITE_ACTIONS: readonly SiteAction[] = [ 'renew', 'cancel', 'remove', 'auto-renew' ];

export const SITE_ACTION_TITLES: Record< SiteAction, string > = {
	renew: __( 'Renew subscriptions' ),
	cancel: __( 'Cancel subscriptions' ),
	remove: __( 'Remove upgrades' ),
	'auto-renew': __( 'Turn off auto-renew' ),
};

export function isSiteAction( value: string ): value is SiteAction {
	return ( SITE_ACTIONS as readonly string[] ).includes( value );
}

export function getEligiblePurchases(
	purchases: Purchase[],
	primaryPurchase: Purchase,
	action: SiteAction
): Purchase[] {
	const sitePurchases = purchases.filter( ( p ) => p.blog_id === primaryPurchase.blog_id );

	if ( action === 'cancel' || action === 'auto-renew' ) {
		return sitePurchases.filter( ( p ) => p.is_auto_renew_enabled || p.ID === primaryPurchase.ID );
	}

	// Remove and renew: show all site purchases
	return sitePurchases;
}
