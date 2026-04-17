/**
 * Checks if a domain can be updated (e.g. nameservers, WHOIS contact details).
 * Returns false if the domain has a pending transfer (edits are locked during
 * transfer) or has expired (edits require renewal first).
 * @param {Object} domain - domain object
 * @returns {boolean}
 */
export function isDomainUpdateable( domain ) {
	return ! domain?.pendingTransfer && ! domain?.expired;
}
