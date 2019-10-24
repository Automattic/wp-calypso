// Jetpack products constants
export const PRODUCT_JETPACK_BACKUP = 'jetpack_backup';
export const PRODUCT_JETPACK_BACKUP_DAILY = 'jetpack_backup_daily';
export const PRODUCT_JETPACK_BACKUP_REALTIME = 'jetpack_backup_realtime';
export const PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY = 'jetpack_backup_daily_monthly';
export const PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY = 'jetpack_backup_realtime_monthly';

export const JETPACK_BACKUP_PRODUCTS_YEARLY = [
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
];
export const JETPACK_BACKUP_PRODUCTS_MONTHLY = [
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
];
export const JETPACK_BACKUP_PRODUCTS = [
	...JETPACK_BACKUP_PRODUCTS_YEARLY,
	...JETPACK_BACKUP_PRODUCTS_MONTHLY,
];

// @TODO: Translate those strings once we have confirmed the copy.
export const JETPACK_BACKUP_PRODUCT_NAMES = {
	[ PRODUCT_JETPACK_BACKUP_DAILY ]: 'Daily Backups',
	[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: 'Daily Backups',
	[ PRODUCT_JETPACK_BACKUP_REALTIME ]: 'Real-Time Backups',
	[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: 'Real-Time Backups',
};
