import { hasCheckoutVersion } from '@automattic/wpcom-checkout';

export function useHideCheckoutUpsellNudge(): boolean {
	if ( hasCheckoutVersion( 'hide-checkout-upsell-nudge' ) ) {
		return true;
	}
	return false;
}
