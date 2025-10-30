import { SSH_HOST_DISPLAY_NAMES } from '../steps/ssh-host-support-urls';

/**
 * Checks if a hosting provider is supported for SSH migration
 * @param hostingSlug - The hosting provider slug (e.g., 'digitalocean', 'bluehost')
 * @returns true if the hosting provider is in the supported list
 */
export const isHostingSupportedForSSHMigration = ( hostingSlug?: string ): boolean => {
	if ( ! hostingSlug ) {
		return false;
	}

	const normalizedSlug = hostingSlug.toLowerCase().trim();
	return normalizedSlug in SSH_HOST_DISPLAY_NAMES;
};
