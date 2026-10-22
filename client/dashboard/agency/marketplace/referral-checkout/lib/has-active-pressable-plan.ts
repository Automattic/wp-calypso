import {
	isPressableAddonProduct,
	isPressableHostingProduct,
} from '../../hosting/lib/pressable-plans';
import type { Referral, ReferralPurchase } from '@automattic/api-core';

const isActivePressablePlan = ( purchase: ReferralPurchase ) => {
	const licenseKey = purchase.license?.license_key;
	return (
		purchase.status === 'active' &&
		!! licenseKey &&
		! purchase.license?.revoked_at &&
		isPressableHostingProduct( licenseKey ) &&
		! isPressableAddonProduct( licenseKey )
	);
};

/**
 * A Pressable add-on can only be referred to a client who already runs a
 * referred Pressable plan, since the add-on attaches to that plan.
 */
export function hasActivePressablePlanForClient(
	referrals: Referral[] | undefined,
	clientEmail: string
): boolean {
	const email = clientEmail.trim().toLowerCase();
	if ( ! referrals?.length || ! email ) {
		return false;
	}
	const clientReferral = referrals.find(
		( referral ) => referral.client?.email?.trim().toLowerCase() === email
	);
	return clientReferral?.purchases.some( isActivePressablePlan ) ?? false;
}
