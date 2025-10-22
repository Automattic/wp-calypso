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

/**
 * Validates SSH username
 * @param username - The username to validate
 * @returns true if valid, false otherwise
 */
export const validateUsername = ( username: string ): boolean => {
	if ( ! username || username.trim().length === 0 ) {
		return false;
	}

	// Username should be alphanumeric with underscores, hyphens
	// and typically 1-32 characters
	const usernameRegex = /^[a-z_]([a-z0-9_-]{0,31}|[a-z0-9_-]{0,30}\$)$/i;
	return usernameRegex.test( username );
};

/**
 * Validates SSH password
 * @param password - The password to validate
 * @returns true if valid (not empty), false otherwise
 */
export const validatePassword = ( password: string ): boolean => {
	return password && password.length > 0;
};

/**
 * Validates SSH public key format
 * @param key - The SSH public key to validate
 * @returns true if valid, false otherwise
 */
export const validatePublicKey = ( key: string ): boolean => {
	if ( ! key || key.trim().length === 0 ) {
		return false;
	}

	// Basic SSH public key format validation
	// Should start with ssh-rsa, ssh-ed25519, ecdsa-sha2-nistp256, etc.
	const sshKeyRegex =
		/^(ssh-rsa|ssh-ed25519|ecdsa-sha2-nistp\d+|ssh-dss)\s+[A-Za-z0-9+/]+[=]{0,3}(\s+.*)?$/;
	return sshKeyRegex.test( key.trim() );
};

interface SSHCredentials {
	serverAddress: string;
	port: number;
	username: string;
	authMethod: 'password' | 'key';
	password?: string;
	publicKey?: string;
}

/**
 * Validates complete SSH credentials
 * @param credentials - The SSH credentials to validate
 * @returns Object with isValid flag and error message if invalid
 */
export const validateSSHCredentials = (
	credentials: SSHCredentials
): { isValid: boolean; error?: string } => {
	if ( ! validateServerAddress( credentials.serverAddress ) ) {
		return { isValid: false, error: 'Invalid server address format' };
	}

	if ( ! validatePort( credentials.port ) ) {
		return { isValid: false, error: 'Port must be between 1 and 65535' };
	}

	if ( ! validateUsername( credentials.username ) ) {
		return { isValid: false, error: 'Invalid username format' };
	}

	if ( credentials.authMethod === 'password' ) {
		if ( ! credentials.password || ! validatePassword( credentials.password ) ) {
			return { isValid: false, error: 'Password is required' };
		}
	} else if ( credentials.authMethod === 'key' ) {
		if ( ! credentials.publicKey || ! validatePublicKey( credentials.publicKey ) ) {
			return { isValid: false, error: 'Valid SSH public key is required' };
		}
	}

	return { isValid: true };
};
