/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { translate } from 'i18n-calypso';

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

export const JETPACK_PRODUCTS_LIST = [ ...JETPACK_BACKUP_PRODUCTS ];

export const JETPACK_BACKUP_PRODUCT_LANDING_PAGE_URL = 'https://jetpack.com/upgrade/backup/';

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

// Translatable strings
export const getJetpackProductsShortNames = () => {
	return {
		[ PRODUCT_JETPACK_BACKUP_DAILY ]: translate( 'Daily Backups' ),
		[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: translate( 'Daily Backups' ),
		[ PRODUCT_JETPACK_BACKUP_REALTIME ]: translate( 'Real-Time Backups' ),
		[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: translate( 'Real-Time Backups' ),
	};
};

export const getJetpackProductsDisplayNames = () => {
	return {
		[ PRODUCT_JETPACK_BACKUP_DAILY ]: (
			<Fragment>
				{ translate( 'Jetpack Backup {{em}}Daily{{/em}}', {
					components: {
						em: <em />,
					},
				} ) }
			</Fragment>
		),
		[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: (
			<Fragment>
				{ translate( 'Jetpack Backup {{em}}Daily{{/em}}', {
					components: {
						em: <em />,
					},
				} ) }
			</Fragment>
		),
		[ PRODUCT_JETPACK_BACKUP_REALTIME ]: (
			<Fragment>
				{ translate( 'Jetpack Backup {{em}}Real-Time{{/em}}', {
					components: {
						em: <em />,
					},
				} ) }
			</Fragment>
		),
		[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: (
			<Fragment>
				{ translate( 'Jetpack Backup {{em}}Real-Time{{/em}}', {
					components: {
						em: <em />,
					},
				} ) }
			</Fragment>
		),
	};
};

export const getJetpackProductsTaglines = () => {
	return {
		[ PRODUCT_JETPACK_BACKUP_DAILY ]: translate(
			'Your data is being securely backed up every day with a 30-day archive.'
		),
		[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: translate(
			'Your data is being securely backed up every day with a 30-day archive.'
		),
		[ PRODUCT_JETPACK_BACKUP_REALTIME ]: translate(
			'Your data is being securely backed up as you edit.'
		),
		[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: translate(
			'Your data is being securely backed up as you edit.'
		),
	};
};

export const getJetpackProductsDescriptions = () => {
	return {
		[ PRODUCT_JETPACK_BACKUP_DAILY ]: translate(
			'Always-on backups ensure you never lose your site. Your changes are saved every day with a 30-day archive.'
		),
		[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: translate(
			'Always-on backups ensure you never lose your site. Your changes are saved every day with a 30-day archive.'
		),
		[ PRODUCT_JETPACK_BACKUP_REALTIME ]: translate(
			'Always-on backups ensure you never lose your site. Your changes are saved as you edit and you have unlimited backup archives.'
		),
		[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: translate(
			'Always-on backups ensure you never lose your site. Your changes are saved as you edit and you have unlimited backup archives.'
		),
	};
};

export const getJetpackProducts = () => [
	{
		title: translate( 'Jetpack Backup' ),
		description: translate(
			'Always-on backups ensure you never lose your site. Choose from real-time or daily backups.'
		),
		id: PRODUCT_JETPACK_BACKUP,
		options: {
			yearly: JETPACK_BACKUP_PRODUCTS_YEARLY,
			monthly: JETPACK_BACKUP_PRODUCTS_MONTHLY,
		},
		optionShortNames: getJetpackProductsShortNames(),
		optionDisplayNames: getJetpackProductsDisplayNames(),
		optionDescriptions: getJetpackProductsDescriptions(),
		optionsLabel: translate( 'Select a backup option:' ),
	},
];
