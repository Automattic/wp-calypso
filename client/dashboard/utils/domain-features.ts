import type { SiteDomain } from '../data/types';

export function hasGSuiteWithUs( domain: SiteDomain ) {
	const status = domain.googleAppsSubscription?.status ?? '';
	return ! [ '', 'no_subscription', 'other_provider' ].includes( status );
}

export function hasTitanMailWithUs( domain: SiteDomain ) {
	const subscriptionStatus = domain.titanMailSubscription?.status ?? '';
	return subscriptionStatus === 'active' || subscriptionStatus === 'suspended';
}
