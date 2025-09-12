export function getMonetizeSubscriptionUrl( subscriptionId: string ): string {
	return `/me/billing/monetize-subscriptions/${ subscriptionId }`;
}
export function getMonetizeSubscriptionsUrl(): string {
	return '/me/billing/monetize-subscriptions/';
}
