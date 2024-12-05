import { translate } from 'i18n-calypso';

export interface ProductData {
	description: string;
	data?: any;
	name?: string;
	slug?: string;
}
export interface JetpackProducts {
	[ key: string ]: ProductData;
}

// It will show in this order: left to right, top to down, 2x4 grid.
export const jetpackProductsToShow: JetpackProducts = {
	'jetpack-backup-t1': {
		description: translate( 'Cloud backups and one-click restores.' ),
	},
	'jetpack-ai': {
		description: translate( 'Create content with ease.' ),
	},
	'jetpack-monitor': {
		description: translate( '1-minute alerts & SMS notifications.' ),
	},
	'jetpack-boost': {
		description: translate( 'Speed up your site.' ),
	},
	'jetpack-social-basic': {
		description: translate( 'Write once, post everywhere.' ),
	},
	'jetpack-scan': {
		description: translate( 'Automatic malware scanning.' ),
	},
	'jetpack-security-t1': {
		description: translate( 'VaultPress Backup, Scan, Anti-spam.' ),
	},
	'jetpack-complete': {
		description: translate( 'The full Jetpack suite.' ),
	},
	'jetpack-growth': {
		description: translate( 'Grow your audience effortlessly.' ),
	},
};
