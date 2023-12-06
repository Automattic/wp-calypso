import { hasCheckoutVersion } from '@automattic/wpcom-checkout';

export function useHideCheckoutIncludedPurchases(): boolean {
	if ( hasCheckoutVersion( 'hide-checkout-included-purchases' ) ) {
		return true;
	}
	return false;
}
