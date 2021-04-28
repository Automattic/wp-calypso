/**
 * External dependencies
 */
import React, { createElement } from 'react';
import { numberFormat, translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	JETPACK_ANTI_SPAM_PRODUCTS,
	JETPACK_ANTI_SPAM_PRODUCT_LANDING_PAGE_URL,
	JETPACK_BACKUP_PRODUCTS,
	JETPACK_BACKUP_PRODUCTS_MONTHLY,
	JETPACK_BACKUP_PRODUCTS_YEARLY,
	JETPACK_BACKUP_PRODUCT_LANDING_PAGE_URL,
	JETPACK_SCAN_PRODUCTS,
	JETPACK_SCAN_PRODUCT_LANDING_PAGE_URL,
	JETPACK_SEARCH_PRODUCTS,
	JETPACK_SEARCH_PRODUCT_LANDING_PAGE_URL,
	PRODUCT_JETPACK_ANTI_SPAM,
	PRODUCT_JETPACK_ANTI_SPAM_MONTHLY,
	PRODUCT_JETPACK_BACKUP,
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
	PRODUCT_JETPACK_SCAN,
	PRODUCT_JETPACK_SCAN_MONTHLY,
	PRODUCT_JETPACK_SCAN_REALTIME,
	PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY,
	PRODUCT_JETPACK_SEARCH,
	PRODUCT_JETPACK_SEARCH_MONTHLY,
	PRODUCT_WPCOM_SEARCH,
	PRODUCT_WPCOM_SEARCH_MONTHLY,
} from './index';

// Translatable strings
export const getJetpackProductsShortNames = () => {
	return {
		[ PRODUCT_JETPACK_BACKUP_DAILY ]: translate( 'Backup {{em}}Daily{{/em}}', {
			components: {
				em: createElement( 'em' ),
			},
		} ),
		[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: translate( 'Backup {{em}}Daily{{/em}}', {
			components: {
				em: createElement( 'em' ),
			},
		} ),
		[ PRODUCT_JETPACK_BACKUP_REALTIME ]: translate( 'Backup {{em}}Real-time{{/em}}', {
			components: {
				em: createElement( 'em', { style: { whiteSpace: 'nowrap' } } ),
			},
		} ),
		[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: translate( 'Backup {{em}}Real-time{{/em}}', {
			components: {
				em: createElement( 'em', { style: { whiteSpace: 'nowrap' } } ),
			},
		} ),
		[ PRODUCT_JETPACK_SCAN_REALTIME ]: translate( 'Scan {{em}}Real-time{{/em}}', {
			components: {
				em: createElement( 'em', { style: { whiteSpace: 'nowrap' } } ),
			},
		} ),
		[ PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY ]: translate( 'Scan {{em}}Real-time{{/em}}', {
			components: {
				em: createElement( 'em', { style: { whiteSpace: 'nowrap' } } ),
			},
		} ),
		[ PRODUCT_JETPACK_SCAN ]: translate( 'Scan' ),
		[ PRODUCT_JETPACK_SCAN_MONTHLY ]: translate( 'Scan' ),
		[ PRODUCT_JETPACK_SEARCH ]: translate( 'Search' ),
		[ PRODUCT_JETPACK_SEARCH_MONTHLY ]: translate( 'Search' ),
		[ PRODUCT_WPCOM_SEARCH ]: translate( 'Search' ),
		[ PRODUCT_WPCOM_SEARCH_MONTHLY ]: translate( 'Search' ),
		[ PRODUCT_JETPACK_ANTI_SPAM ]: translate( 'Anti-spam' ),
		[ PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ]: translate( 'Anti-spam' ),
	};
};

export const getJetpackProductsDisplayNames = () => {
	const backupDaily = translate( 'Backup {{em}}Daily{{/em}}', {
		components: {
			em: <em />,
		},
	} );
	const backupRealtime = (
		<>
			{ translate( 'Backup {{em}}Real-time{{/em}}', {
				components: {
					em: <em style={ { whiteSpace: 'nowrap' } } />,
				},
			} ) }
		</>
	);
	const search = translate( 'Site Search' );
	const scan = translate( 'Scan' );
	const scanRealtime = (
		<>
			{ translate( 'Scan {{em}}Real-time{{/em}}', {
				components: {
					em: <em style={ { whiteSpace: 'nowrap' } } />,
				},
			} ) }
		</>
	);
	const antiSpam = translate( 'Anti-spam' );

	return {
		[ PRODUCT_JETPACK_BACKUP_DAILY ]: backupDaily,
		[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: backupDaily,
		[ PRODUCT_JETPACK_BACKUP_REALTIME ]: backupRealtime,
		[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: backupRealtime,
		[ PRODUCT_JETPACK_SEARCH ]: search,
		[ PRODUCT_JETPACK_SEARCH_MONTHLY ]: search,
		[ PRODUCT_WPCOM_SEARCH ]: search,
		[ PRODUCT_WPCOM_SEARCH_MONTHLY ]: search,
		[ PRODUCT_JETPACK_SCAN ]: scan,
		[ PRODUCT_JETPACK_SCAN_MONTHLY ]: scan,
		[ PRODUCT_JETPACK_SCAN_REALTIME ]: scanRealtime,
		[ PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY ]: scanRealtime,
		[ PRODUCT_JETPACK_ANTI_SPAM ]: antiSpam,
		[ PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ]: antiSpam,
	};
};

export const getJetpackProductsCallToAction = () => {
	const backupDaily = translate( 'Get Backup {{em}}Daily{{/em}}', {
		components: {
			em: <em />,
		},
	} );
	const backupRealtime = (
		<>
			{ translate( 'Get Backup {{em}}Real-time{{/em}}', {
				components: {
					em: <em style={ { whiteSpace: 'nowrap' } } />,
				},
			} ) }
		</>
	);
	const search = translate( 'Get Site Search' );
	const scan = translate( 'Get Scan' );
	const antiSpam = translate( 'Get Anti-spam' );

	return {
		[ PRODUCT_JETPACK_BACKUP_DAILY ]: backupDaily,
		[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: backupDaily,
		[ PRODUCT_JETPACK_BACKUP_REALTIME ]: backupRealtime,
		[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: backupRealtime,
		[ PRODUCT_JETPACK_SEARCH ]: search,
		[ PRODUCT_JETPACK_SEARCH_MONTHLY ]: search,
		[ PRODUCT_JETPACK_SCAN ]: scan,
		[ PRODUCT_JETPACK_SCAN_MONTHLY ]: scan,
		[ PRODUCT_JETPACK_ANTI_SPAM ]: antiSpam,
		[ PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ]: antiSpam,
	};
};

export const getJetpackProductsTaglines = () => {
	const backupDailyTagline = translate( 'Best for sites with occasional updates' );
	const backupRealtimeTagline = translate( 'Best for sites with frequent updates' );
	const backupOwnedTagline = translate( 'Your site is actively being backed up' );
	const searchTagline = translate( 'Recommended for sites with lots of products or content' );
	const scanTagline = translate( 'Protect your site' );
	const scanOwnedTagline = translate( 'Your site is actively being scanned for malicious threats' );
	const antiSpamTagline = translate( 'Block spam automatically' );

	return {
		[ PRODUCT_JETPACK_BACKUP_DAILY ]: {
			default: backupDailyTagline,
			owned: backupOwnedTagline,
		},
		[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: {
			default: backupDailyTagline,
			owned: backupOwnedTagline,
		},
		[ PRODUCT_JETPACK_BACKUP_REALTIME ]: {
			default: backupRealtimeTagline,
			owned: backupOwnedTagline,
		},
		[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: {
			default: backupRealtimeTagline,
			owned: backupOwnedTagline,
		},
		[ PRODUCT_JETPACK_SEARCH ]: { default: searchTagline },
		[ PRODUCT_JETPACK_SEARCH_MONTHLY ]: { default: searchTagline },
		[ PRODUCT_WPCOM_SEARCH ]: { default: searchTagline },
		[ PRODUCT_WPCOM_SEARCH_MONTHLY ]: { default: searchTagline },
		[ PRODUCT_JETPACK_SCAN ]: {
			default: scanTagline,
			owned: scanOwnedTagline,
		},
		[ PRODUCT_JETPACK_SCAN_MONTHLY ]: {
			default: scanTagline,
			owned: scanOwnedTagline,
		},
		[ PRODUCT_JETPACK_ANTI_SPAM ]: { default: antiSpamTagline },
		[ PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ]: { default: antiSpamTagline },
	};
};

export const getJetpackProductsDescriptions = () => {
	const backupDailyDescription = translate(
		'Never lose a word, image, page, or time worrying about your site with automated backups & one-click restores.'
	);
	const backupRealtimeDescription = translate(
		'Real-time backups save every change and one-click restores get you back online quickly.'
	);
	const searchDescription = translate(
		'Help your site visitors find answers instantly so they keep reading and buying. Great for sites with a lot of content.'
	);

	const scanDescription = translate(
		'Automatic scanning and one-click fixes keep your site one step ahead of security threats and malware.'
	);
	const antiSpamDescription = translate(
		'Save time and get better responses by automatically blocking spam from your comments and forms.'
	);

	return {
		[ PRODUCT_JETPACK_BACKUP_DAILY ]: backupDailyDescription,
		[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: backupDailyDescription,
		[ PRODUCT_JETPACK_BACKUP_REALTIME ]: backupRealtimeDescription,
		[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: backupRealtimeDescription,
		[ PRODUCT_JETPACK_SEARCH ]: searchDescription,
		[ PRODUCT_JETPACK_SEARCH_MONTHLY ]: searchDescription,
		[ PRODUCT_JETPACK_SCAN ]: scanDescription,
		[ PRODUCT_JETPACK_SCAN_MONTHLY ]: scanDescription,
		[ PRODUCT_JETPACK_SCAN_REALTIME ]: scanDescription,
		[ PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY ]: scanDescription,
		[ PRODUCT_JETPACK_ANTI_SPAM ]: antiSpamDescription,
		[ PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ]: antiSpamDescription,
	};
};

export const getJetpackProducts = () => [
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
	{
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
	},
	{
		title: translate( 'Jetpack Anti-spam' ),
		description: getJetpackProductsDescriptions()[ PRODUCT_JETPACK_ANTI_SPAM ],
		// There is only one option per billing interval, but this
		// component still needs the full display with radio buttons.
		forceRadios: true,
		hasPromo: false,
		id: PRODUCT_JETPACK_ANTI_SPAM,
		link: {
			label: translate( 'Learn more' ),
			props: {
				location: 'product_jetpack_anti_spam_description',
				slug: 'learn-more-anti-spam',
			},
			url: JETPACK_ANTI_SPAM_PRODUCT_LANDING_PAGE_URL,
		},
		options: {
			yearly: [ PRODUCT_JETPACK_ANTI_SPAM ],
			monthly: [ PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ],
		},
		optionShortNames: getJetpackProductsShortNames(),
		optionDisplayNames: getJetpackProductsDisplayNames(),
		optionDescriptions: getJetpackProductsDescriptions(),
		optionsLabel: translate( 'Select a product option:' ),
		slugs: JETPACK_ANTI_SPAM_PRODUCTS,
	},
	{
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
		optionShortNamesCallback: ( productObject ) => {
			const quantity = productObject.price_tier_usage_quantity;
			if ( quantity <= 100 ) {
				return translate( 'Pricing Tier 1: Up to 100 records' );
			}
			if ( quantity <= 1000 ) {
				return translate( 'Pricing Tier 2: Up to 1,000 records' );
			}
			if ( quantity <= 10000 ) {
				return translate( 'Pricing Tier 3: Up to 10,000 records' );
			}
			if ( quantity <= 100000 ) {
				return translate( 'Pricing Tier 4: Up to 100,000 records' );
			}
			if ( quantity <= 100000 ) {
				return translate( 'Pricing Tier 5: Up to 1,000,000 records' );
			}
			if ( quantity > 100000 ) {
				// This is a catch-all tier with prices increasing
				// proportionally per million records, so define fake
				// tiers here to show the user what they will actually
				// pay and why.
				const numberOfDefinedTiers = 5;
				const tierNumber = numberOfDefinedTiers + Math.floor( quantity / 1000000 );
				const tierMaximumRecords = 1000000 * Math.ceil( quantity / 1000000 );
				return translate( 'Pricing Tier %(tierNumber)d: Up to %(tierMaximumRecords)s records', {
					args: {
						tierNumber,
						tierMaximumRecords: numberFormat( tierMaximumRecords ),
					},
				} );
			}
			return null;
		},
		optionActionButtonNames: getJetpackProductsShortNames(),
		optionDisplayNames: getJetpackProductsDisplayNames(),
		optionDescriptions: getJetpackProductsDescriptions(),
		optionsLabelCallback: ( productObject ) => {
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
	},
];
