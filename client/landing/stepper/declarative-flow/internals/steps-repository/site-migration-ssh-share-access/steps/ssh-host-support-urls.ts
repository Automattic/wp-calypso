import { localizeUrl } from '@automattic/i18n-utils';

/**
 * Mapping of normalized host slugs to their display names
 */
export const SSH_HOST_DISPLAY_NAMES: Record< string, string > = {
	godaddy: 'GoDaddy',
	bluehost: 'Bluehost',
	ionos: 'IONOS',
	hostinger: 'Hostinger',
	inmotion: 'InMotion Hosting',
	aruba: 'Aruba',
	hostgator: 'HostGator',
	digitalocean: 'DigitalOcean',
	hetzner: 'Hetzner',
	namecheap: 'Namecheap',
	ovh: 'OVHcloud',
	dreamhost: 'DreamHost',
};

interface SSHSupportDoc {
	url: string;
	postId?: number;
}

/**
 * Mapping of hosting providers to their specific SSH migration support documentation
 */
const SSH_HOST_SUPPORT_DOCS: Record< string, SSHSupportDoc > = {
	godaddy: {
		url: localizeUrl( 'https://wordpress.com/support/migrate-a-site-from-godaddy-using-ssh/' ),
		postId: 445551,
	},
	bluehost: {
		url: localizeUrl( 'https://wordpress.com/support/migrate-a-site-from-bluehost-using-ssh/' ),
		postId: 445540,
	},
	ionos: {
		url: localizeUrl( 'https://wordpress.com/support/migrate-a-site-from-ionos-using-ssh/' ),
		postId: 445543,
	},
	hostinger: {
		url: localizeUrl( 'https://wordpress.com/support/migrate-a-site-from-hostinger-using-ssh/' ),
		postId: 445542,
	},
	inmotion: {
		url: localizeUrl(
			'https://wordpress.com/support/migrate-a-site-from-inmotion-hosting-using-ssh/'
		),
		postId: 445544,
	},
	aruba: {
		url: localizeUrl(
			'https://wordpress.com/support/migrate-a-site-from-aruba-hosting-using-ssh/'
		),
		postId: 445539,
	},
	hostgator: {
		url: localizeUrl( 'https://wordpress.com/support/migrate-a-site-from-hostgator-using-ssh/' ),
		postId: 445541,
	},
	digitalocean: {
		url: localizeUrl( 'https://wordpress.com/support/migrate-a-site-from-digitalocean-using-ssh/' ),
		postId: 445545,
	},
	hetzner: {
		url: localizeUrl( 'https://wordpress.com/support/migrate-a-site-from-hetzner-using-ssh/' ),
		postId: 445546,
	},
	namecheap: {
		url: localizeUrl( 'https://wordpress.com/support/migrate-a-site-from-namecheap-using-ssh/' ),
		postId: 445547,
	},
	ovh: {
		url: localizeUrl( 'https://wordpress.com/support/migrate-a-site-from-ovhcloud-using-ssh/' ),
		postId: 445548,
	},
	dreamhost: {
		url: localizeUrl( 'https://wordpress.com/support/migrate-a-site-from-dreamhost-using-ssh/' ),
		postId: 445549,
	},
};

/**
 * Generic fallback for hosts without specific documentation
 */
const GENERIC_SSH_MIGRATION_SUPPORT_DOC: SSHSupportDoc = {
	url: localizeUrl( 'https://wordpress.com/support/migrate-a-site-to-wordpress-com-using-ssh/' ),
	postId: 445550,
};

/**
 * Get the display name for a specific hosting provider
 * @param host - The hosting provider slug (case-insensitive)
 * @returns The display name for the host, or undefined if not found
 */
export const getSSHHostDisplayName = ( host?: string ): string | undefined => {
	if ( ! host ) {
		return undefined;
	}

	const normalizedHost = host.toLowerCase().trim();
	return SSH_HOST_DISPLAY_NAMES[ normalizedHost ];
};

/**
 * Get the support documentation for a specific hosting provider
 * @param host - The hosting provider name (case-insensitive)
 * @returns The support doc object for the host, or the generic fallback if not found
 */
export const getSSHSupportDoc = ( host?: string ): SSHSupportDoc => {
	if ( ! host ) {
		return GENERIC_SSH_MIGRATION_SUPPORT_DOC;
	}

	const normalizedHost = host.toLowerCase().trim();
	return SSH_HOST_SUPPORT_DOCS[ normalizedHost ] ?? GENERIC_SSH_MIGRATION_SUPPORT_DOC;
};

/**
 * Get the support URL for a specific hosting provider
 * @param host - The hosting provider name (case-insensitive)
 * @returns The support URL for the host, or the generic fallback if not found
 * @deprecated Use getSSHSupportDoc instead for inline help center support
 */
export const getSSHSupportUrl = ( host?: string ): string => {
	return getSSHSupportDoc( host ).url;
};
