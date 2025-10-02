import { DomainSummary, SiteDomain } from '@automattic/api-core';

export function getGSuiteSubscriptionStatus( domain: SiteDomain | undefined ): string {
	return domain?.google_apps_subscription?.status ?? '';
}

export function hasGSuiteWithUs( domain: SiteDomain | undefined ): boolean {
	const status = getGSuiteSubscriptionStatus( domain );

	return ! [ '', 'no_subscription', 'other_provider' ].includes( status );
}

export function hasTitanMailWithUs( domain: SiteDomain ): boolean {
	const subscriptionStatus = domain?.titan_mail_subscription?.status ?? '';

	return subscriptionStatus === 'active' || subscriptionStatus === 'suspended';
}

export function hasEmailForwards( domain: SiteDomain ) {
	return domain?.email_forwards_count ?? 0;
}

export const domainHasEmail = ( domain: DomainSummary ) =>
	hasTitanMailWithUs( domain ) || hasGSuiteWithUs( domain ) || hasEmailForwards( domain );
