/**
 * Checks whether a URL path belongs to the Domain Connect authorization flow.
 * Domain Connect is an open protocol that allows DNS providers to offer one-click
 * service configuration via an OAuth-like redirect. The authorization path
 * `/domain-connect/authorize/` initiates that flow and requires special handling.
 * @param {string} path - the URL path to check
 * @returns {boolean}
 */
export function isDomainConnectAuthorizePath( path ) {
	return path && typeof path === 'string' && path.startsWith( '/domain-connect/authorize/' );
}
