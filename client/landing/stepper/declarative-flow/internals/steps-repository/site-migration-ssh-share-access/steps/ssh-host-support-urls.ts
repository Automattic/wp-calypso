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

/**
 * Mapping of hosting providers to their specific SSH migration support documentation URLs
 */
const SSH_HOST_SUPPORT_URLS: Record< string, string > = {
	godaddy: localizeUrl( 'https://wordpress.com/support/migrate-a-site-from-godaddy-using-ssh/' ),
	bluehost: localizeUrl( 'https://wordpress.com/support/migrate-a-site-from-bluehost-using-ssh/' ),
	ionos: localizeUrl( 'https://wordpress.com/support/migrate-a-site-from-ionos-using-ssh/' ),
	hostinger: localizeUrl(
		'https://wordpress.com/support/migrate-a-site-from-hostinger-using-ssh/'
	),
	inmotion: localizeUrl(
		'https://wordpress.com/support/migrate-a-site-from-inmotion-hosting-using-ssh/'
	),
	aruba: localizeUrl(
		'https://wordpress.com/support/migrate-a-site-from-aruba-hosting-using-ssh/'
	),
	hostgator: localizeUrl(
		'https://wordpress.com/support/migrate-a-site-from-hostgator-using-ssh/'
	),
	digitalocean: localizeUrl(
		'https://wordpress.com/support/migrate-a-site-from-digitalocean-using-ssh/'
	),
	hetzner: localizeUrl( 'https://wordpress.com/support/migrate-a-site-from-hetzner-using-ssh/' ),
	namecheap: localizeUrl(
		'https://wordpress.com/support/migrate-a-site-from-namecheap-using-ssh/'
	),
	ovh: localizeUrl( 'https://wordpress.com/support/migrate-a-site-from-ovhcloud-using-ssh/' ),
	dreamhost: localizeUrl(
		'https://wordpress.com/support/migrate-a-site-from-dreamhost-using-ssh/'
	),
};

/**
 * Generic fallback URL for hosts without specific documentation
 */
const GENERIC_SSH_MIGRATION_SUPPORT_URL = localizeUrl(
	'https://wordpress.com/support/migrate-a-site-to-wordpress-com-using-ssh/'
);

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
 * Get the support URL for a specific hosting provider
 * @param host - The hosting provider name (case-insensitive)
 * @returns The support URL for the host, or the generic fallback if not found
 */
export const getSSHSupportUrl = ( host?: string ): string => {
	if ( ! host ) {
		return GENERIC_SSH_MIGRATION_SUPPORT_URL;
	}

	const normalizedHost = host.toLowerCase().trim();
	return SSH_HOST_SUPPORT_URLS[ normalizedHost ] ?? GENERIC_SSH_MIGRATION_SUPPORT_URL;
};
