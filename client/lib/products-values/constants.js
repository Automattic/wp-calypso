/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { numberFormat, translate } from 'i18n-calypso';

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
export const isJetpackSearch = slug => JETPACK_SEARCH_PRODUCTS.includes( slug );

export const JETPACK_SCAN_PRODUCTS = [ PRODUCT_JETPACK_SCAN, PRODUCT_JETPACK_SCAN_MONTHLY ];

export const JETPACK_PRODUCTS_LIST = [
	...JETPACK_BACKUP_PRODUCTS,
	...( isEnabled( 'jetpack/search-product' ) ? JETPACK_SEARCH_PRODUCTS : [] ),
	...( isEnabled( 'jetpack/scan-product' ) ? JETPACK_SCAN_PRODUCTS : [] ),
];

// Jetpack Search tiers
export const JETPACK_SEARCH_TIER_UP_TO_100_RECORDS = 'up_to_100_records';
export const JETPACK_SEARCH_TIER_UP_TO_1K_RECORDS = 'up_to_1k_records';
export const JETPACK_SEARCH_TIER_UP_TO_10K_RECORDS = 'up_to_10k_records';
export const JETPACK_SEARCH_TIER_UP_TO_100K_RECORDS = 'up_to_100k_records';
export const JETPACK_SEARCH_TIER_UP_TO_1M_RECORDS = 'up_to_1m_records';
export const JETPACK_SEARCH_TIER_MORE_THAN_1M_RECORDS = 'more_than_1m_records';

export const JETPACK_BACKUP_PRODUCT_LANDING_PAGE_URL = 'https://jetpack.com/upgrade/backup/';
export const JETPACK_SEARCH_PRODUCT_LANDING_PAGE_URL = 'https://jetpack.com/upgrade/search/';
export const JETPACK_SCAN_PRODUCT_LANDING_PAGE_URL = 'https://jetpack.com/upgrade/scan/';

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
	const scanTagline = 'Scan your site.';
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
	const searchDescription = translate(
		'Incredibly powerful and customizable, Jetpack Search helps your visitors instantly find the right content – right when they need it.'
	);
	const scanDescription = translate(
		'Automatic scanning and one-click fixes keep your site one step ahead of security threats.'
	);
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
			hasPromo: true,
			id: PRODUCT_JETPACK_BACKUP,
			link: {
				label: translate( 'Which backup option is best for me?' ),
				props: {
					location: 'product_jetpack_backup_description',
					slug: 'which-one-do-i-need',
				},
				url: JETPACK_BACKUP_PRODUCT_LANDING_PAGE_URL,
			},
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
			description: getJetpackProductsDescriptions()[ PRODUCT_JETPACK_SEARCH ],
			// There is only one option per billing interval, but this
			// component still needs the full display with radio buttons.
			forceRadios: true,
			hasPromo: false,
			id: PRODUCT_JETPACK_SEARCH,
			link: {
				label: translate( 'Learn more' ),
				props: {
					location: 'product_jetpack_search_description',
					slug: 'learn-more-search',
				},
				url: JETPACK_SEARCH_PRODUCT_LANDING_PAGE_URL,
			},
			options: {
				yearly: [ PRODUCT_JETPACK_SEARCH ],
				monthly: [ PRODUCT_JETPACK_SEARCH_MONTHLY ],
			},
			optionShortNamesCallback: productObject => {
				const numberOfDefinedTiers = 5;
				switch ( productObject.price_tier_slug ) {
					case JETPACK_SEARCH_TIER_UP_TO_100_RECORDS:
						return translate( 'Tier 1: Up to 100 records' );
					case JETPACK_SEARCH_TIER_UP_TO_1K_RECORDS:
						return translate( 'Tier 2: Up to 1,000 records' );
					case JETPACK_SEARCH_TIER_UP_TO_10K_RECORDS:
						return translate( 'Tier 3: Up to 10,000 records' );
					case JETPACK_SEARCH_TIER_UP_TO_100K_RECORDS:
						return translate( 'Tier 4: Up to 100,000 records' );
					case JETPACK_SEARCH_TIER_UP_TO_1M_RECORDS:
						return translate( 'Tier 5: Up to 1,000,000 records' );
					case JETPACK_SEARCH_TIER_MORE_THAN_1M_RECORDS: {
						// This is a catch-all tier with prices increasing
						// proportionally per million records, so define fake
						// tiers here to show the user what they will actually
						// pay and why.
						const tierNumber =
							numberOfDefinedTiers +
							Math.floor( productObject.price_tier_usage_quantity / 1000000 );
						const tierMaximumRecords =
							1000000 * Math.ceil( productObject.price_tier_usage_quantity / 1000000 );
						return translate( 'Tier %(tierNumber)d: Up to %(tierMaximumRecords)s records', {
							args: {
								tierNumber,
								tierMaximumRecords: numberFormat( tierMaximumRecords ),
							},
						} );
					}
					default:
						return null;
				}
			},
			optionActionButtonNames: getJetpackProductsShortNames(),
			optionDisplayNames: getJetpackProductsDisplayNames(),
			optionDescriptions: getJetpackProductsDescriptions(),
			optionsLabelCallback: productObject => {
				return translate(
					'Your current site record size: %(numberOfRecords)s record',
					'Your current site record size: %(numberOfRecords)s records',
					{
						count: productObject.price_tier_usage_quantity,
						args: {
							numberOfRecords: numberFormat( productObject.price_tier_usage_quantity ),
						},
					}
				);
			},
			slugs: JETPACK_SEARCH_PRODUCTS,
		} );
	isEnabled( 'jetpack/scan-product' ) &&
		output.push( {
			title: translate( 'Jetpack Scan' ),
			description: getJetpackProductsDescriptions()[ PRODUCT_JETPACK_SCAN ],
			// There is only one option per billing interval, but this
			// component still needs the full display with radio buttons.
			forceRadios: true,
			hasPromo: false,
			id: PRODUCT_JETPACK_SCAN,
			link: {
				label: translate( 'Learn more' ),
				props: {
					location: 'product_jetpack_scan_description',
					slug: 'learn-more-scan',
				},
				url: JETPACK_SCAN_PRODUCT_LANDING_PAGE_URL,
			},
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
