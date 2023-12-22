import { translate } from 'i18n-calypso';

export interface ProductData {
	description: string;
	url: string;
	urlText?: string;
	product_slug?: string;
	data?: any;
	name?: string;
}
export interface JetpackProducts {
	[ key: string ]: ProductData;
}

// It will show in this order: left to right, top to down, 2x4 grid.
export const jetpackProductsToShow: JetpackProducts = {
	'jetpack-backup-t1': {
		description: translate( 'Cloud backups and one-click restores.' ),
		url: 'https://jetpack.com/upgrade/backup/',
	},
	'jetpack-ai': {
		description: translate( 'Create content with ease.' ),
		url: 'https://jetpack.com/ai/',
	},
	'jetpack-monitor': {
		description: translate( '1-minute alerts & SMS notifications.' ),
		url: 'https://jetpack.com/features/security/downtime-monitoring/',
	},
	'jetpack-boost': {
		description: translate( 'Speed up your site.' ),
		url: 'https://jetpack.com/boost/',
	},
	'jetpack-social-basic': {
		description: translate( 'Write once, post everywhere.' ),
		url: 'https://jetpack.com/social/',
	},
	'jetpack-scan': {
		description: translate( 'Automatic malware scanning.' ),
		url: 'https://jetpack.com/upgrade/scan/',
	},
	'jetpack-security-t1': {
		description: translate( 'VaultPress Backup, Scan, Anti-spam.' ),
		url: 'https://jetpack.com/features/security/',
	},
	'jetpack-complete': {
		description: translate( 'The full Jetpack suite.' ),
		url: 'https://jetpack.com/complete/',
	},
};
