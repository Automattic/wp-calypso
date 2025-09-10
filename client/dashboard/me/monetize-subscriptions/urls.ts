export function getMonetizeSubscriptionUrl( subscriptionId: string ): string {
	return `/me/purchases/other/${ subscriptionId }`;
}
