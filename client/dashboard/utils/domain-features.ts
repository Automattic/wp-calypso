import type { SiteDomain } from '../data/types';

export function hasGSuiteWithUs( domain: SiteDomain ) {
	const status = domain.google_apps_subscription?.status ?? '';
	return ! [ '', 'no_subscription', 'other_provider' ].includes( status );
}

export function hasTitanMailWithUs( domain: SiteDomain ) {
	const subscriptionStatus = domain.titan_mail_subscription?.status ?? '';
	return subscriptionStatus === 'active' || subscriptionStatus === 'suspended';
}
