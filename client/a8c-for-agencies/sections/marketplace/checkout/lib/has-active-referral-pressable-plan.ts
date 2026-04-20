import { isPressableAddonProduct, isPressableHostingProduct } from '../../lib/hosting';
import type { Referral, ReferralPurchase } from 'calypso/a8c-for-agencies/sections/referrals/types';

function hasActiveReferralPressablePlan( purchase: ReferralPurchase ) {
	const licenseKey = purchase.license?.license_key;

	return (
		purchase.status === 'active' &&
		!! licenseKey &&
		! purchase.license?.revoked_at &&
		isPressableHostingProduct( licenseKey ) &&
		! isPressableAddonProduct( licenseKey )
	);
}

export default function hasActiveReferralPressablePlanForClient(
	referrals: Referral[] | undefined,
	clientEmail: string
) {
	if ( ! referrals?.length || ! clientEmail.trim() ) {
		return false;
	}

	const normalizedEmail = clientEmail.trim().toLowerCase();
	const clientReferral = referrals.find(
		( referral ) => referral.client?.email?.trim().toLowerCase() === normalizedEmail
	);

	if ( ! clientReferral ) {
		return false;
	}

	return clientReferral.purchases.some( hasActiveReferralPressablePlan );
}
