import { SSH_HOST_DISPLAY_NAMES } from '../steps/ssh-host-support-urls';

/**
 * List of hosting providers currently enabled for SSH migration
 */
const ENABLED_SSH_HOSTS: string[] = [
	'hostinger-international-limited',
	'ionos',
	'ovh-sas',
	'bluehost',
	'namecheap',
];

/**
 * Checks if a hosting provider is supported for SSH migration
 * @param hostingSlug - The hosting provider slug (e.g., 'digitalocean', 'bluehost')
 * @returns true if the hosting provider is in the enabled list
 */
export const isHostingSupportedForSSHMigration = ( hostingSlug?: string ): boolean => {
	if ( ! hostingSlug ) {
		return false;
	}

	const normalizedSlug = hostingSlug.toLowerCase().trim();

	// Check if host exists in display names (validates it's a known host)
	if ( ! ( normalizedSlug in SSH_HOST_DISPLAY_NAMES ) ) {
		return false;
	}

	// Check if host is in the enabled list
	return ENABLED_SSH_HOSTS.includes( normalizedSlug );
};
