export function getMaxTitanMailboxCount( domain ) {
	return domain.titanMailSubscription?.maximumMailboxCount ?? 1;
}
