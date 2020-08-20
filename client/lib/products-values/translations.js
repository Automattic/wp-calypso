/**
 * External dependencies
 */
import React from 'react';
import { numberFormat, translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import * as CONSTANTS from './constants.js';

// Translatable strings
export const getJetpackProductsShortNames = () => {
	return {
		[ CONSTANTS.PRODUCT_JETPACK_BACKUP_DAILY ]: translate( 'Daily Backups' ),
		[ CONSTANTS.PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: translate( 'Daily Backups' ),
		[ CONSTANTS.PRODUCT_JETPACK_BACKUP_REALTIME ]: translate( 'Real-Time Backups' ),
		[ CONSTANTS.PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: translate( 'Real-Time Backups' ),
		[ CONSTANTS.PRODUCT_JETPACK_SEARCH ]: translate( 'Search' ),
		[ CONSTANTS.PRODUCT_JETPACK_SEARCH_MONTHLY ]: translate( 'Search' ),
		[ CONSTANTS.PRODUCT_WPCOM_SEARCH ]: translate( 'Search' ),
		[ CONSTANTS.PRODUCT_WPCOM_SEARCH_MONTHLY ]: translate( 'Search' ),
		[ CONSTANTS.PRODUCT_JETPACK_SCAN ]: translate( 'Daily Scan' ),
		[ CONSTANTS.PRODUCT_JETPACK_SCAN_MONTHLY ]: translate( 'Daily Scan' ),
		[ CONSTANTS.PRODUCT_JETPACK_ANTI_SPAM ]: translate( 'Anti-Spam' ),
		[ CONSTANTS.PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ]: translate( 'Anti-Spam' ),
	};
};

export const getJetpackProductsDisplayNames = () => {
	const backupDaily = (
		<>
			{ translate( 'Backup {{em}}Daily{{/em}}', {
				components: {
					em: <em />,
				},
			} ) }
		</>
	);
	const backupRealtime = (
		<>
			{ translate( 'Backup {{em}}Real-Time{{/em}}', {
				components: {
					em: <em />,
				},
			} ) }
		</>
	);
	const search = translate( 'Jetpack Search' );
	const scanDaily = (
		<>
			{ translate( 'Jetpack Scan {{em}}Daily{{/em}}', {
				components: {
					em: <em />,
				},
			} ) }
		</>
	);

	const antiSpam = <>{ translate( 'Jetpack Anti-Spam' ) }</>;
	return {
		[ CONSTANTS.PRODUCT_JETPACK_BACKUP_DAILY ]: backupDaily,
		[ CONSTANTS.PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: backupDaily,
		[ CONSTANTS.PRODUCT_JETPACK_BACKUP_REALTIME ]: backupRealtime,
		[ CONSTANTS.PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: backupRealtime,
		[ CONSTANTS.PRODUCT_JETPACK_SEARCH ]: search,
		[ CONSTANTS.PRODUCT_JETPACK_SEARCH_MONTHLY ]: search,
		[ CONSTANTS.PRODUCT_WPCOM_SEARCH ]: search,
		[ CONSTANTS.PRODUCT_WPCOM_SEARCH_MONTHLY ]: search,
		[ CONSTANTS.PRODUCT_JETPACK_SCAN ]: scanDaily,
		[ CONSTANTS.PRODUCT_JETPACK_SCAN_MONTHLY ]: scanDaily,
		[ CONSTANTS.PRODUCT_JETPACK_ANTI_SPAM ]: antiSpam,
		[ CONSTANTS.PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ]: antiSpam,
	};
};
export const getJetpackProductsTaglines = () => {
	const searchTagline = translate( 'Search your site.' );
	const scanTagline = translate( 'Scan your site.' );
	const antiSpamTagline = translate( 'Automatically clear spam from comments and forms.' );
	return {
		[ CONSTANTS.PRODUCT_JETPACK_BACKUP_DAILY ]: translate(
			'Best for sites with occasional updates'
		),
		[ CONSTANTS.PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: translate(
			'Best for sites with occasional updates'
		),
		[ CONSTANTS.PRODUCT_JETPACK_BACKUP_REALTIME ]: translate(
			'Best for sites with frequent updates'
		),
		[ CONSTANTS.PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: translate(
			'Best for sites with frequent updates'
		),
		[ CONSTANTS.PRODUCT_JETPACK_SEARCH ]: searchTagline,
		[ CONSTANTS.PRODUCT_JETPACK_SEARCH_MONTHLY ]: searchTagline,
		[ CONSTANTS.PRODUCT_WPCOM_SEARCH ]: searchTagline,
		[ CONSTANTS.PRODUCT_WPCOM_SEARCH_MONTHLY ]: searchTagline,
		[ CONSTANTS.PRODUCT_JETPACK_SCAN ]: scanTagline,
		[ CONSTANTS.PRODUCT_JETPACK_SCAN_MONTHLY ]: scanTagline,
		[ CONSTANTS.PRODUCT_JETPACK_ANTI_SPAM ]: antiSpamTagline,
		[ CONSTANTS.PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ]: antiSpamTagline,
	};
};

export const getJetpackProductsDescriptions = () => {
	const searchDescription = translate(
		'Incredibly powerful and customizable, Jetpack Search helps your visitors instantly find the right content – right when they need it.'
	);
	const scanDescription = translate(
		'Automatic scanning and one-click fixes keep your site one step ahead of security threats.'
	);
	const antiSpamDescription = translate(
		'Automatically clear spam from comments and forms. Save time, get more responses, give your visitors a better experience – all without lifting a finger.'
	);
	return {
		[ CONSTANTS.PRODUCT_JETPACK_BACKUP_DAILY ]: translate(
			'Never lose a word, image, page, or time worrying about your site'
		),
		[ CONSTANTS.PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: translate(
			'Never lose a word, image, page, or time worrying about your site'
		),
		[ CONSTANTS.PRODUCT_JETPACK_BACKUP_REALTIME ]: translate(
			'Real-time backups save every change and one-click restores get you back online quickly.'
		),
		[ CONSTANTS.PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: translate(
			'Real-time backups save every change and one-click restores get you back online quickly.'
		),
		[ CONSTANTS.PRODUCT_JETPACK_SEARCH ]: searchDescription,
		[ CONSTANTS.PRODUCT_JETPACK_SEARCH_MONTHLY ]: searchDescription,
		[ CONSTANTS.PRODUCT_JETPACK_SCAN ]: scanDescription,
		[ CONSTANTS.PRODUCT_JETPACK_SCAN_MONTHLY ]: scanDescription,
		[ CONSTANTS.PRODUCT_JETPACK_ANTI_SPAM ]: antiSpamDescription,
		[ CONSTANTS.PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ]: antiSpamDescription,
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
			id: CONSTANTS.PRODUCT_JETPACK_BACKUP,
			link: {
				label: translate( 'Which backup option is best for me?' ),
				props: {
					location: 'product_jetpack_backup_description',
					slug: 'which-one-do-i-need',
				},
				url: CONSTANTS.JETPACK_BACKUP_PRODUCT_LANDING_PAGE_URL,
			},
			options: {
				yearly: CONSTANTS.JETPACK_BACKUP_PRODUCTS_YEARLY,
				monthly: CONSTANTS.JETPACK_BACKUP_PRODUCTS_MONTHLY,
			},
			optionShortNames: getJetpackProductsShortNames(),
			optionDisplayNames: getJetpackProductsDisplayNames(),
			optionDescriptions: getJetpackProductsDescriptions(),
			optionsLabel: translate( 'Select a backup option:' ),
			slugs: CONSTANTS.JETPACK_BACKUP_PRODUCTS,
		},
	];
	isEnabled( 'jetpack/scan-product' ) &&
		output.push( {
			title: translate( 'Jetpack Scan' ),
			description: getJetpackProductsDescriptions()[ CONSTANTS.PRODUCT_JETPACK_SCAN ],
			// There is only one option per billing interval, but this
			// component still needs the full display with radio buttons.
			forceRadios: true,
			hasPromo: false,
			id: CONSTANTS.PRODUCT_JETPACK_SCAN,
			link: {
				label: translate( 'Learn more' ),
				props: {
					location: 'product_jetpack_scan_description',
					slug: 'learn-more-scan',
				},
				url: CONSTANTS.JETPACK_SCAN_PRODUCT_LANDING_PAGE_URL,
			},
			options: {
				yearly: [ CONSTANTS.PRODUCT_JETPACK_SCAN ],
				monthly: [ CONSTANTS.PRODUCT_JETPACK_SCAN_MONTHLY ],
			},
			optionShortNames: getJetpackProductsShortNames(),
			optionDisplayNames: getJetpackProductsDisplayNames(),
			optionDescriptions: getJetpackProductsDescriptions(),
			optionsLabel: translate( 'Select a product option:' ),
			slugs: CONSTANTS.JETPACK_SCAN_PRODUCTS,
		} );
	isEnabled( 'jetpack/anti-spam-product' ) &&
		output.push( {
			title: translate( 'Jetpack Anti-Spam' ),
			description: getJetpackProductsDescriptions()[ CONSTANTS.PRODUCT_JETPACK_ANTI_SPAM ],
			// There is only one option per billing interval, but this
			// component still needs the full display with radio buttons.
			forceRadios: true,
			hasPromo: false,
			id: CONSTANTS.PRODUCT_JETPACK_ANTI_SPAM,
			link: {
				label: translate( 'Learn more' ),
				props: {
					location: 'product_jetpack_anti_spam_description',
					slug: 'learn-more-anti-spam',
				},
				url: CONSTANTS.JETPACK_ANTI_SPAM_PRODUCT_LANDING_PAGE_URL,
			},
			options: {
				yearly: [ CONSTANTS.PRODUCT_JETPACK_ANTI_SPAM ],
				monthly: [ CONSTANTS.PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ],
			},
			optionShortNames: getJetpackProductsShortNames(),
			optionDisplayNames: getJetpackProductsDisplayNames(),
			optionDescriptions: getJetpackProductsDescriptions(),
			optionsLabel: translate( 'Select a product option:' ),
			slugs: CONSTANTS.JETPACK_ANTI_SPAM_PRODUCTS,
		} );
	isEnabled( 'jetpack/search-product' ) &&
		output.push( {
			title: translate( 'Jetpack Search' ),
			description: getJetpackProductsDescriptions()[ CONSTANTS.PRODUCT_JETPACK_SEARCH ],
			// There is only one option per billing interval, but this
			// component still needs the full display with radio buttons.
			forceRadios: true,
			hasPromo: false,
			id: CONSTANTS.PRODUCT_JETPACK_SEARCH,
			link: {
				label: translate( 'Learn more' ),
				props: {
					location: 'product_jetpack_search_description',
					slug: 'learn-more-search',
				},
				url: CONSTANTS.JETPACK_SEARCH_PRODUCT_LANDING_PAGE_URL,
			},
			options: {
				yearly: [ CONSTANTS.PRODUCT_JETPACK_SEARCH ],
				monthly: [ CONSTANTS.PRODUCT_JETPACK_SEARCH_MONTHLY ],
			},
			optionShortNamesCallback: ( productObject ) => {
				const numberOfDefinedTiers = 5;
				switch ( productObject.price_tier_slug ) {
					case CONSTANTS.JETPACK_SEARCH_TIER_UP_TO_100_RECORDS:
						return translate( 'Tier 1: Up to 100 records' );
					case CONSTANTS.JETPACK_SEARCH_TIER_UP_TO_1K_RECORDS:
						return translate( 'Tier 2: Up to 1,000 records' );
					case CONSTANTS.JETPACK_SEARCH_TIER_UP_TO_10K_RECORDS:
						return translate( 'Tier 3: Up to 10,000 records' );
					case CONSTANTS.JETPACK_SEARCH_TIER_UP_TO_100K_RECORDS:
						return translate( 'Tier 4: Up to 100,000 records' );
					case CONSTANTS.JETPACK_SEARCH_TIER_UP_TO_1M_RECORDS:
						return translate( 'Tier 5: Up to 1,000,000 records' );
					case CONSTANTS.JETPACK_SEARCH_TIER_MORE_THAN_1M_RECORDS: {
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
			slugs: CONSTANTS.JETPACK_SEARCH_PRODUCTS,
		} );

	return output;
};
