/**
 * External dependencies
 */
import React, { createElement } from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	PRODUCT_JETPACK_ANTI_SPAM,
	PRODUCT_JETPACK_ANTI_SPAM_MONTHLY,
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
	PRODUCT_JETPACK_BACKUP,
	PRODUCT_JETPACK_BACKUP_MONTHLY,
	PRODUCT_JETPACK_BACKUP_PRO,
	PRODUCT_JETPACK_BACKUP_PRO_MONTHLY,
	PRODUCT_JETPACK_SCAN,
	PRODUCT_JETPACK_SCAN_MONTHLY,
	PRODUCT_JETPACK_SCAN_REALTIME,
	PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY,
	PRODUCT_JETPACK_SEARCH,
	PRODUCT_JETPACK_SEARCH_MONTHLY,
	PRODUCT_WPCOM_SEARCH,
	PRODUCT_WPCOM_SEARCH_MONTHLY,
} from './constants';

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
		[ PRODUCT_JETPACK_BACKUP ]: translate( 'Backup' ),
		[ PRODUCT_JETPACK_BACKUP_MONTHLY ]: translate( 'Backup' ),
		[ PRODUCT_JETPACK_BACKUP_PRO ]: translate( 'Backup Pro' ),
		[ PRODUCT_JETPACK_BACKUP_PRO_MONTHLY ]: translate( 'Backup Pro' ),
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
	const backup = translate( 'Backup' );
	const backupPro = translate( 'Backup Pro' );
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
		[ PRODUCT_JETPACK_BACKUP ]: backup,
		[ PRODUCT_JETPACK_BACKUP_MONTHLY ]: backup,
		[ PRODUCT_JETPACK_BACKUP_PRO ]: backupPro,
		[ PRODUCT_JETPACK_BACKUP_PRO_MONTHLY ]: backupPro,
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
	const backup = translate( 'Get Backup' );
	const backupPro = translate( 'Get Backup Pro' );
	const search = translate( 'Get Site Search' );
	const scan = translate( 'Get Scan' );
	const antiSpam = translate( 'Get Anti-spam' );

	return {
		[ PRODUCT_JETPACK_BACKUP_DAILY ]: backupDaily,
		[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: backupDaily,
		[ PRODUCT_JETPACK_BACKUP_REALTIME ]: backupRealtime,
		[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: backupRealtime,
		[ PRODUCT_JETPACK_BACKUP ]: backup,
		[ PRODUCT_JETPACK_BACKUP_MONTHLY ]: backup,
		[ PRODUCT_JETPACK_BACKUP_PRO ]: backupPro,
		[ PRODUCT_JETPACK_BACKUP_PRO_MONTHLY ]: backupPro,
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
		// TODO: get taglines specifically for the new Jetpack Backup products
		[ PRODUCT_JETPACK_BACKUP ]: {
			default: backupRealtimeTagline,
			owned: backupOwnedTagline,
		},
		[ PRODUCT_JETPACK_BACKUP_MONTHLY ]: {
			default: backupRealtimeTagline,
			owned: backupOwnedTagline,
		},
		[ PRODUCT_JETPACK_BACKUP_PRO ]: {
			default: backupRealtimeTagline,
			owned: backupOwnedTagline,
		},
		[ PRODUCT_JETPACK_BACKUP_PRO_MONTHLY ]: {
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
	const backupDescription = backupDailyDescription;
	const backupProDescription = translate(
		'Go back in time and recover all your information for up to a year, with 2TB storage space.'
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
		[ PRODUCT_JETPACK_BACKUP ]: backupDescription,
		[ PRODUCT_JETPACK_BACKUP_MONTHLY ]: backupDescription,
		[ PRODUCT_JETPACK_BACKUP_PRO ]: backupProDescription,
		[ PRODUCT_JETPACK_BACKUP_PRO_MONTHLY ]: backupProDescription,
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
