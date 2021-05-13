export function isDomainUpdateable( domain ) {
	return ! domain?.pendingTransfer && ! domain?.expired;
}
