export function isValidNameServer( nameServer: string ): boolean {
	if ( ! nameServer ) {
		return false;
	}

	// The subdomain part of name servers in Key-Systems cannot be longer than 50 characters
	if (
		nameServer.length > 50 ||
		! nameServer.match(
			/^([A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)(\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/
		)
	) {
		return false;
	}

	return true;
}

export function isValidIpAddress( ipAddress: string ): boolean {
	if ( ! ipAddress ) {
		return false;
	}

	if ( ! ipAddress.match( /^(\d{1,3}\.){3}\d{1,3}$/ ) ) {
		return false;
	}

	return true;
}
