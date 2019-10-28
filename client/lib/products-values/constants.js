/**
 * External dependencies
 */
import React, { Fragment } from 'react';

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
export const JETPACK_BACKUP_PRODUCT_DISPLAY_NAMES = {
	[ PRODUCT_JETPACK_BACKUP_DAILY ]: (
		<Fragment>
			Jetpack Backup <em>Daily</em>
		</Fragment>
	),
	[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: (
		<Fragment>
			Jetpack Backup <em>Daily</em>
		</Fragment>
	),
	[ PRODUCT_JETPACK_BACKUP_REALTIME ]: (
		<Fragment>
			Jetpack Backup <em>Real-Time</em>
		</Fragment>
	),
	[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: (
		<Fragment>
			Jetpack Backup <em>Real-Time</em>
		</Fragment>
	),
};

export const JETPACK_PRODUCT_PRICE_MATRIX = {
	[ PRODUCT_JETPACK_BACKUP_DAILY ]: {
		relatedProduct: PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
		ratio: 12,
	},
	[ PRODUCT_JETPACK_BACKUP_REALTIME ]: {
		relatedProduct: PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
		ratio: 12,
	},
};
