export function getConfiguredTitanMailboxCount( domain ) {
	return domain.titanMailSubscription?.numberOfMailboxes ?? 0;
}
