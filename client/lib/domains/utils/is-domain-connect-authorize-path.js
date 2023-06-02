export function isDomainConnectAuthorizePath( path ) {
	return path && typeof path === 'string' && path.startsWith( '/domain-connect/authorize/' );
}
