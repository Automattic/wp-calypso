/**
 * External dependencies
 */
import React, { createElement } from 'react';
import { numberFormat, translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { isEnabled } from 'calypso/config';
import { getJetpackCROActiveVersion } from 'calypso/my-sites/plans/jetpack-plans/abtest';
import * as CONSTANTS from './constants.js';

// Translatable strings
export const getJetpackProductsShortNames = () => {
	return {
		[ CONSTANTS.PRODUCT_JETPACK_BACKUP_DAILY ]: translate( 'Backup {{em}}Daily{{/em}}', {
			components: {
				em: createElement( 'em' ),
			},
		} ),
		[ CONSTANTS.PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: translate( 'Backup {{em}}Daily{{/em}}', {
			components: {
				em: createElement( 'em' ),
			},
		} ),
		[ CONSTANTS.PRODUCT_JETPACK_BACKUP_REALTIME ]: translate( 'Backup {{em}}Real-time{{/em}}', {
			components: {
				em: createElement( 'em' ),
			},
		} ),
		[ CONSTANTS.PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: translate(
			'Backup {{em}}Real-time{{/em}}',
			{
				components: {
					em: createElement( 'em' ),
				},
			}
		),
		[ CONSTANTS.PRODUCT_JETPACK_SEARCH ]: translate( 'Search' ),
		[ CONSTANTS.PRODUCT_JETPACK_SEARCH_MONTHLY ]: translate( 'Search' ),
		[ CONSTANTS.PRODUCT_WPCOM_SEARCH ]: translate( 'Search' ),
		[ CONSTANTS.PRODUCT_WPCOM_SEARCH_MONTHLY ]: translate( 'Search' ),
		[ CONSTANTS.PRODUCT_JETPACK_SCAN ]: translate( 'Scan' ),
		[ CONSTANTS.PRODUCT_JETPACK_SCAN_MONTHLY ]: translate( 'Scan' ),
		[ CONSTANTS.PRODUCT_JETPACK_ANTI_SPAM ]: translate( 'Anti-spam' ),
		[ CONSTANTS.PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ]: translate( 'Anti-spam' ),
	};
};

export const getJetpackProductsDisplayNames = () => {
	const currentCROvariant = getJetpackCROActiveVersion();
	let backupDaily;
	if ( currentCROvariant === 'v2' ) {
		backupDaily = (
			<>
				{ translate( 'Jetpack Backup {{em}}Daily{{/em}}', {
					components: {
						em: <em />,
					},
				} ) }
			</>
		);
	} else if ( currentCROvariant === 'spp' ) {
		backupDaily = <>{ translate( 'Jetpack Backup' ) }</>;
	} else {
		backupDaily = (
			<>
				{ translate( 'Backup {{em}}Daily{{/em}}', {
					components: {
						em: <em />,
					},
				} ) }
			</>
		);
	}

	const backupRealtime = (
		<>
			{ currentCROvariant === 'v2'
				? translate( 'Jetpack Backup {{em}}Real-Time{{/em}}', {
						components: {
							em: <em />,
						},
				  } )
				: translate( 'Backup {{em}}Real-Time{{/em}}', {
						components: {
							em: <em />,
						},
				  } ) }
		</>
	);
	const search =
		{
			v2: translate( 'Jetpack Site Search' ),
			i5: translate( 'Site Search' ),
			spp: translate( 'Site Search' ),
		}[ currentCROvariant ] || translate( 'Jetpack Search' );
	const scan =
		{
			i5: translate( 'Scan' ),
			spp: translate( 'Scan' ),
		}[ currentCROvariant ] || translate( 'Jetpack Scan' );
	const antiSpam = {
		i5: translate( 'Anti-spam' ),
		spp: translate( 'Anti-Spam' ),
	}[ getJetpackCROActiveVersion() ] || <>{ translate( 'Jetpack Anti-spam' ) }</>;

	return {
		[ CONSTANTS.PRODUCT_JETPACK_BACKUP_DAILY ]: backupDaily,
		[ CONSTANTS.PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: backupDaily,
		[ CONSTANTS.PRODUCT_JETPACK_BACKUP_REALTIME ]: backupRealtime,
		[ CONSTANTS.PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: backupRealtime,
		[ CONSTANTS.PRODUCT_JETPACK_SEARCH ]: search,
		[ CONSTANTS.PRODUCT_JETPACK_SEARCH_MONTHLY ]: search,
		[ CONSTANTS.PRODUCT_WPCOM_SEARCH ]: search,
		[ CONSTANTS.PRODUCT_WPCOM_SEARCH_MONTHLY ]: search,
		[ CONSTANTS.PRODUCT_JETPACK_SCAN ]: scan,
		[ CONSTANTS.PRODUCT_JETPACK_SCAN_MONTHLY ]: scan,
		[ CONSTANTS.PRODUCT_JETPACK_ANTI_SPAM ]: antiSpam,
		[ CONSTANTS.PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ]: antiSpam,
	};
};

export const getJetpackProductsCallToAction = () => {
	const currentCROvariant = getJetpackCROActiveVersion();
	const backupDaily = (
		<>
			{ currentCROvariant === 'spp'
				? translate( 'Get Jetpack Backup' )
				: translate( 'Get Backup {{em}}Daily{{/em}}', {
						components: {
							em: <em />,
						},
				  } ) }
		</>
	);
	const backupRealtime = (
		<>
			{ translate( 'Get Backup {{em}}Real-Time{{/em}}', {
				components: {
					em: <em />,
				},
			} ) }
		</>
	);
	const search =
		{
			v1: translate( 'Get Jetpack Search' ),
			i5: translate( 'Get Site Search' ),
			spp: translate( 'Get Site Search' ),
		}[ currentCROvariant ] || translate( 'Get Search' );
	const scan =
		currentCROvariant === 'v1' ? translate( 'Get Jetpack Scan' ) : translate( 'Get Scan' );
	const antiSpam =
		{
			v1: translate( 'Get Jetpack Anti-spam' ),
			spp: translate( 'Get Anti-Spam' ),
		}[ currentCROvariant ] || translate( 'Get Anti-spam' );

	return {
		[ CONSTANTS.PRODUCT_JETPACK_BACKUP_DAILY ]: backupDaily,
		[ CONSTANTS.PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: backupDaily,
		[ CONSTANTS.PRODUCT_JETPACK_BACKUP_REALTIME ]: backupRealtime,
		[ CONSTANTS.PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: backupRealtime,
		[ CONSTANTS.PRODUCT_JETPACK_SEARCH ]: search,
		[ CONSTANTS.PRODUCT_JETPACK_SEARCH_MONTHLY ]: search,
		[ CONSTANTS.PRODUCT_JETPACK_SCAN ]: scan,
		[ CONSTANTS.PRODUCT_JETPACK_SCAN_MONTHLY ]: scan,
		[ CONSTANTS.PRODUCT_JETPACK_ANTI_SPAM ]: antiSpam,
		[ CONSTANTS.PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ]: antiSpam,
	};
};

export const getJetpackProductsTaglines = () => {
	const currentCROvariant = getJetpackCROActiveVersion();
	const backupDailyTagline =
		currentCROvariant === 'v1'
			? translate( 'Automated backups with one-click restores' )
			: translate( 'Best for sites with occasional updates' );
	const backupRealtimeTagline = translate( 'Best for sites with frequent updates' );
	const backupOwnedTagline = translate( 'Your site is actively being backed up' );
	const searchTagline =
		{
			v1: translate( 'Great for sites with a lot of content' ),
			v2: translate( 'Recommended for sites with lots of content' ),
		}[ currentCROvariant ] || translate( 'Recommended for sites with lots of products or content' );
	const scanTagline = translate( 'Protect your site' );
	const scanOwnedTagline = translate( 'Your site is actively being scanned for malicious threats' );
	const antiSpamTagline =
		currentCROvariant === 'v2'
			? translate( 'Powered By Akismet' )
			: translate( 'Block spam automatically' );

	return {
		[ CONSTANTS.PRODUCT_JETPACK_BACKUP_DAILY ]: {
			default: backupDailyTagline,
			owned: backupOwnedTagline,
		},
		[ CONSTANTS.PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: {
			default: backupDailyTagline,
			owned: backupOwnedTagline,
		},
		[ CONSTANTS.PRODUCT_JETPACK_BACKUP_REALTIME ]: {
			default: backupRealtimeTagline,
			owned: backupOwnedTagline,
		},
		[ CONSTANTS.PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: {
			default: backupRealtimeTagline,
			owned: backupOwnedTagline,
		},
		[ CONSTANTS.PRODUCT_JETPACK_SEARCH ]: { default: searchTagline },
		[ CONSTANTS.PRODUCT_JETPACK_SEARCH_MONTHLY ]: { default: searchTagline },
		[ CONSTANTS.PRODUCT_WPCOM_SEARCH ]: { default: searchTagline },
		[ CONSTANTS.PRODUCT_WPCOM_SEARCH_MONTHLY ]: { default: searchTagline },
		[ CONSTANTS.PRODUCT_JETPACK_SCAN ]: {
			default: scanTagline,
			owned: scanOwnedTagline,
		},
		[ CONSTANTS.PRODUCT_JETPACK_SCAN_MONTHLY ]: {
			default: scanTagline,
			owned: scanOwnedTagline,
		},
		[ CONSTANTS.PRODUCT_JETPACK_ANTI_SPAM ]: { default: antiSpamTagline },
		[ CONSTANTS.PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ]: { default: antiSpamTagline },
	};
};

export const getJetpackProductsDescriptions = () => {
	const backupDailyDescription =
		{
			i5: translate(
				'Never lose a word, image, page, or time worrying about your site with automated backups & one-click restores.'
			),
			spp: translate(
				'Never lose a word, image, page, or time worrying about your site with automated backups & one-click restores.'
			),
		}[ getJetpackCROActiveVersion() ] ||
		translate( 'Never lose a word, image, page, or time worrying about your site.' );
	const backupRealtimeDescription = translate(
		'Real-time backups save every change and one-click restores get you back online quickly.'
	);
	const searchDescription =
		{
			i5: translate(
				'Help your site visitors find answers instantly so they keep reading and buying. Great for sites with a lot of content.'
			),
		}[ getJetpackCROActiveVersion() ] ||
		translate( 'Help your site visitors find answers instantly so they keep reading and buying.' );

	const scanDescription = translate(
		'Automatic scanning and one-click fixes keep your site one step ahead of security threats and malware.'
	);
	const antiSpamDescription =
		{
			i5: translate(
				'Save time, get more responses, and give your visitors a better experience, by automatically blocking spam.'
			),
			spp: translate(
				'Save time, get more responses, and give your visitors a better experience, by automatically blocking spam.'
			),
		}[ getJetpackCROActiveVersion() ] ||
		translate(
			'Automated spam protection for comments and forms. Save time, get more responses, and give your visitors a better experience.'
		);

	return {
		[ CONSTANTS.PRODUCT_JETPACK_BACKUP_DAILY ]: backupDailyDescription,
		[ CONSTANTS.PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: backupDailyDescription,
		[ CONSTANTS.PRODUCT_JETPACK_BACKUP_REALTIME ]: backupRealtimeDescription,
		[ CONSTANTS.PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: backupRealtimeDescription,
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
			title: translate( 'Jetpack Anti-spam' ),
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
					return translate( 'Pricing Tier 1: Up to 100 records' );
				case CONSTANTS.JETPACK_SEARCH_TIER_UP_TO_1K_RECORDS:
					return translate( 'Pricing Tier 2: Up to 1,000 records' );
				case CONSTANTS.JETPACK_SEARCH_TIER_UP_TO_10K_RECORDS:
					return translate( 'Pricing Tier 3: Up to 10,000 records' );
				case CONSTANTS.JETPACK_SEARCH_TIER_UP_TO_100K_RECORDS:
					return translate( 'Pricing Tier 4: Up to 100,000 records' );
				case CONSTANTS.JETPACK_SEARCH_TIER_UP_TO_1M_RECORDS:
					return translate( 'Pricing Tier 5: Up to 1,000,000 records' );
				case CONSTANTS.JETPACK_SEARCH_TIER_MORE_THAN_1M_RECORDS: {
					// This is a catch-all tier with prices increasing
					// proportionally per million records, so define fake
					// tiers here to show the user what they will actually
					// pay and why.
					const tierNumber =
						numberOfDefinedTiers + Math.floor( productObject.price_tier_usage_quantity / 1000000 );
					const tierMaximumRecords =
						1000000 * Math.ceil( productObject.price_tier_usage_quantity / 1000000 );
					return translate( 'Pricing Tier %(tierNumber)d: Up to %(tierMaximumRecords)s records', {
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
