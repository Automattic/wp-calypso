export function hasTitanMailWithUs( domain ) {
	const subscriptionStatus = domain?.titanMailSubscription?.status ?? '';

	return subscriptionStatus === 'active' || subscriptionStatus === 'suspended';
}
