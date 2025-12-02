/**
 * Validates a server address format
 * @param address - The server address to validate
 * @returns true if valid, false otherwise
 */
export const validateServerAddress = ( address: string ): boolean => {
	if ( ! address || address.trim().length === 0 ) {
		return false;
	}

	// Basic domain/IP validation
	// Accepts: domain.com, subdomain.domain.com, IP addresses
	const domainRegex =
		/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
	const ipRegex =
		/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

	return domainRegex.test( address ) || ipRegex.test( address );
};

/**
 * Validates a port number
 * @param port - The port number to validate
 * @returns true if valid (1-65535), false otherwise
 */
export const validatePort = ( port: number ): boolean => {
	return port >= 1 && port <= 65535 && Number.isInteger( port );
};
