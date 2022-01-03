export function getGSuiteMailboxCount( domain ) {
	return domain?.googleAppsSubscription?.totalUserCount ?? 0;
}
