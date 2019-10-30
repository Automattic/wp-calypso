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
export const JETPACK_BACKUP_PRODUCT_SHORT_NAMES = {
	[ PRODUCT_JETPACK_BACKUP_DAILY ]: 'Daily Backups',
	[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: 'Daily Backups',
	[ PRODUCT_JETPACK_BACKUP_REALTIME ]: 'Real-Time Backups',
	[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: 'Real-Time Backups',
};
export const JETPACK_BACKUP_PRODUCT_DAILY_DISPLAY_NAME = (
	<Fragment>
		Jetpack Backup <em>Daily</em>
	</Fragment>
);
export const JETPACK_BACKUP_PRODUCT_REALTIME_DISPLAY_NAME = (
	<Fragment>
		Jetpack Backup <em>Real-Time</em>
	</Fragment>
);
export const JETPACK_BACKUP_PRODUCT_DISPLAY_NAMES = {
	[ PRODUCT_JETPACK_BACKUP_DAILY ]: JETPACK_BACKUP_PRODUCT_DAILY_DISPLAY_NAME,
	[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: JETPACK_BACKUP_PRODUCT_DAILY_DISPLAY_NAME,
	[ PRODUCT_JETPACK_BACKUP_REALTIME ]: JETPACK_BACKUP_PRODUCT_REALTIME_DISPLAY_NAME,
	[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: JETPACK_BACKUP_PRODUCT_REALTIME_DISPLAY_NAME,
};

// @TODO: Translate those strings once we have confirmed the copy.
export const PRODUCT_JETPACK_BACKUP_DESCRIPTION = (
	<p>
		Always-on backups ensure you never lose your site. Choose from real-time or daily backups.{' '}
		<a href="https://jetpack.com/upgrade/backup/">Which one do I need?</a>
	</p>
);
export const PRODUCT_JETPACK_BACKUP_DAILY_DESCRIPTION = (
	<p>
		<strong>Looking for more?</strong> With Real-time backups, we save as you edit and you’ll get
		unlimited backup archives.
	</p>
);
export const PRODUCT_JETPACK_BACKUP_REALTIME_DESCRIPTION = (
	<p>
		Always-on backups ensure you never lose your site. Your changes are saved as you edit and you
		have unlimited backup archives.
	</p>
);

export const JETPACK_BACKUP_PRODUCT_DESCRIPTIONS = {
	[ PRODUCT_JETPACK_BACKUP_DAILY ]: PRODUCT_JETPACK_BACKUP_DAILY_DESCRIPTION,
	[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: PRODUCT_JETPACK_BACKUP_DAILY_DESCRIPTION,
	[ PRODUCT_JETPACK_BACKUP_REALTIME ]: PRODUCT_JETPACK_BACKUP_REALTIME_DESCRIPTION,
	[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: PRODUCT_JETPACK_BACKUP_REALTIME_DESCRIPTION,
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
