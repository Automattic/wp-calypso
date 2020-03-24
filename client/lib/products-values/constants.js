/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';

// Jetpack products constants
export const PRODUCT_JETPACK_BACKUP = 'jetpack_backup';
export const PRODUCT_JETPACK_BACKUP_DAILY = 'jetpack_backup_daily';
export const PRODUCT_JETPACK_BACKUP_REALTIME = 'jetpack_backup_realtime';
export const PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY = 'jetpack_backup_daily_monthly';
export const PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY = 'jetpack_backup_realtime_monthly';
export const PRODUCT_JETPACK_SEARCH = 'jetpack_search';
export const PRODUCT_JETPACK_SEARCH_MONTHLY = 'jetpack_search_monthly';
export const PRODUCT_JETPACK_SCAN = 'jetpack_scan';
export const PRODUCT_JETPACK_SCAN_MONTHLY = 'jetpack_scan_monthly';

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

export const JETPACK_SEARCH_PRODUCTS = [ PRODUCT_JETPACK_SEARCH, PRODUCT_JETPACK_SEARCH_MONTHLY ];

export const JETPACK_SCAN_PRODUCTS = [ PRODUCT_JETPACK_SCAN, PRODUCT_JETPACK_SCAN_MONTHLY ];

export const JETPACK_PRODUCTS_LIST = [
	...JETPACK_BACKUP_PRODUCTS,
	...( isEnabled( 'jetpack/search-product' ) ? JETPACK_SEARCH_PRODUCTS : [] ),
	...( isEnabled( 'jetpack/scan-product' ) ? JETPACK_SCAN_PRODUCTS : [] ),
];

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
	[ PRODUCT_JETPACK_SEARCH ]: {
		relatedProduct: PRODUCT_JETPACK_SEARCH_MONTHLY,
		ratio: 12,
	},
	[ PRODUCT_JETPACK_SCAN ]: {
		relatedProduct: PRODUCT_JETPACK_SCAN_MONTHLY,
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
		[ PRODUCT_JETPACK_SEARCH ]: translate( 'Search' ),
		[ PRODUCT_JETPACK_SEARCH_MONTHLY ]: translate( 'Search' ),
		[ PRODUCT_JETPACK_SCAN ]: translate( 'Scan' ),
		[ PRODUCT_JETPACK_SCAN_MONTHLY ]: translate( 'Scan' ),
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
		[ PRODUCT_JETPACK_SEARCH ]: translate( 'Jetpack Search' ),
		[ PRODUCT_JETPACK_SEARCH_MONTHLY ]: translate( 'Jetpack Search' ),
		[ PRODUCT_JETPACK_SCAN ]: translate( 'Jetpack Scan' ),
		[ PRODUCT_JETPACK_SCAN_MONTHLY ]: translate( 'Jetpack Scan' ),
	};
};

export const getJetpackProductsTaglines = () => {
	const searchTagline = translate( 'Search your site.' );
	const scanTagline = translate( 'Scan your site.' );
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
		[ PRODUCT_JETPACK_SEARCH ]: searchTagline,
		[ PRODUCT_JETPACK_SEARCH_MONTHLY ]: searchTagline,
		[ PRODUCT_JETPACK_SCAN ]: scanTagline,
		[ PRODUCT_JETPACK_SCAN_MONTHLY ]: scanTagline,
	};
};

export const getJetpackProductsDescriptions = () => {
	const searchDescription = translate( 'Search your site.' );
	const scanDescription = translate( 'Scan your site.' );
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
		[ PRODUCT_JETPACK_SEARCH ]: searchDescription,
		[ PRODUCT_JETPACK_SEARCH_MONTHLY ]: searchDescription,
		[ PRODUCT_JETPACK_SCAN ]: scanDescription,
		[ PRODUCT_JETPACK_SCAN_MONTHLY ]: scanDescription,
	};
};

export const getJetpackProducts = () => {
	const output = [
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
			slugs: JETPACK_BACKUP_PRODUCTS,
		},
	];
	isEnabled( 'jetpack/search-product' ) &&
		output.push( {
			title: translate( 'Jetpack Search' ),
			// TODO: Add new description copy for Search
			description: translate(
				'Always-on backups ensure you never lose your site. Choose from real-time or daily backups.'
			),
			id: PRODUCT_JETPACK_SEARCH,
			options: {
				yearly: [ PRODUCT_JETPACK_SEARCH ],
				monthly: [ PRODUCT_JETPACK_SEARCH_MONTHLY ],
			},
			optionShortNames: getJetpackProductsShortNames(),
			optionDisplayNames: getJetpackProductsDisplayNames(),
			optionDescriptions: getJetpackProductsDescriptions(),
			optionsLabel: translate( 'Select a product option:' ),
			slugs: JETPACK_SEARCH_PRODUCTS,
		} );

	isEnabled( 'jetpack/scan-product' ) &&
		output.push( {
			title: translate( 'Jetpack Scan' ),
			// TODO: Add new description copy for Search
			description: translate( 'Always-on scan ensure you never lose your site.' ),
			id: PRODUCT_JETPACK_SCAN,
			options: {
				yearly: [ PRODUCT_JETPACK_SCAN ],
				monthly: [ PRODUCT_JETPACK_SCAN_MONTHLY ],
			},
			optionShortNames: getJetpackProductsShortNames(),
			optionDisplayNames: getJetpackProductsDisplayNames(),
			optionDescriptions: getJetpackProductsDescriptions(),
			optionsLabel: translate( 'Select a product option:' ),
			slugs: JETPACK_SCAN_PRODUCTS,
		} );
	return output;
};
