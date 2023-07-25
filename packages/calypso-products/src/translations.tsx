import { translate, useTranslate } from 'i18n-calypso';
import { createElement, useCallback, useMemo } from 'react';
import {
	PRODUCT_JETPACK_ANTI_SPAM,
	PRODUCT_JETPACK_ANTI_SPAM_MONTHLY,
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T0_YEARLY,
	PRODUCT_JETPACK_BACKUP_T0_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T1_BI_YEARLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T2_YEARLY,
	PRODUCT_JETPACK_BACKUP_T2_MONTHLY,
	PRODUCT_JETPACK_SCAN,
	PRODUCT_JETPACK_SCAN_MONTHLY,
	PRODUCT_JETPACK_SCAN_REALTIME,
	PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY,
	PRODUCT_JETPACK_SEARCH,
	PRODUCT_JETPACK_SEARCH_MONTHLY,
	PRODUCT_JETPACK_VIDEOPRESS,
	PRODUCT_JETPACK_VIDEOPRESS_MONTHLY,
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PLAN_JETPACK_SECURITY_T1_MONTHLY,
	PLAN_JETPACK_SECURITY_T2_YEARLY,
	PLAN_JETPACK_SECURITY_T2_MONTHLY,
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_COMPLETE_MONTHLY,
	PRODUCT_WPCOM_SEARCH,
	PRODUCT_JETPACK_SEARCH_FREE,
	PRODUCT_WPCOM_SEARCH_MONTHLY,
	PRODUCT_JETPACK_BOOST,
	PRODUCT_JETPACK_BOOST_MONTHLY,
	PRODUCT_JETPACK_SOCIAL_BASIC,
	PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY,
	PRODUCT_JETPACK_SOCIAL_ADVANCED,
	PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY,
	PRODUCT_JETPACK_AI_MONTHLY,
	JETPACK_TAG_FOR_VIDEOGRAPHERS,
	JETPACK_TAG_FOR_ALL_SITES,
	JETPACK_TAG_FOR_BLOGGERS,
	JETPACK_TAG_FOR_BLOGS,
	JETPACK_TAG_FOR_EDUCATORS,
	JETPACK_TAG_FOR_MEMBERSHIP_SITES,
	JETPACK_TAG_FOR_NEWS_ORGANISATIONS,
	JETPACK_TAG_FOR_ONLINE_FORUMS,
	JETPACK_TAG_FOR_WOOCOMMERCE_STORES,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_3TB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_5TB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_YEARLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_YEARLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_YEARLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_3TB_YEARLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_5TB_YEARLY,
	PRODUCT_JETPACK_STATS_MONTHLY,
	PRODUCT_JETPACK_STATS_PWYW_YEARLY,
	PRODUCT_JETPACK_STATS_FREE,
} from './constants';
import type { FAQ, SelectorProductFeaturesItem } from './types';
import type { TranslateResult } from 'i18n-calypso';

// Translatable strings
export const getJetpackProductsShortNames = (): Record< string, TranslateResult > => {
	return {
		[ PRODUCT_JETPACK_BACKUP_DAILY ]: translate( 'VaultPress Backup {{em}}Daily{{/em}}', {
			components: {
				em: createElement( 'em' ),
			},
		} ),
		[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: translate( 'VaultPress Backup {{em}}Daily{{/em}}', {
			components: {
				em: createElement( 'em' ),
			},
		} ),
		[ PRODUCT_JETPACK_BACKUP_REALTIME ]: translate( 'VaultPress Backup {{em}}Real-time{{/em}}', {
			components: {
				em: createElement( 'em', { style: { whiteSpace: 'nowrap' } } ),
			},
		} ),
		[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: translate(
			'VaultPress Backup {{em}}Real-time{{/em}}',
			{
				components: {
					em: createElement( 'em', { style: { whiteSpace: 'nowrap' } } ),
				},
			}
		),
		[ PRODUCT_JETPACK_BACKUP_T0_YEARLY ]: translate( 'VaultPress Backup' ),
		[ PRODUCT_JETPACK_BACKUP_T0_MONTHLY ]: translate( 'VaultPress Backup' ),
		[ PRODUCT_JETPACK_BACKUP_T1_YEARLY ]: translate( 'VaultPress Backup' ),
		[ PRODUCT_JETPACK_BACKUP_T1_MONTHLY ]: translate( 'VaultPress Backup' ),
		[ PRODUCT_JETPACK_BACKUP_T2_YEARLY ]: translate( 'VaultPress Backup' ),
		[ PRODUCT_JETPACK_BACKUP_T2_MONTHLY ]: translate( 'VaultPress Backup' ),
		[ PRODUCT_JETPACK_BOOST ]: translate( 'Boost' ),
		[ PRODUCT_JETPACK_BOOST_MONTHLY ]: translate( 'Boost' ),
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
		[ PRODUCT_JETPACK_SEARCH_FREE ]: translate( 'Search' ),
		[ PRODUCT_JETPACK_SEARCH_MONTHLY ]: translate( 'Search' ),
		[ PRODUCT_WPCOM_SEARCH ]: translate( 'Search' ),
		[ PRODUCT_WPCOM_SEARCH_MONTHLY ]: translate( 'Search' ),
		[ PRODUCT_JETPACK_ANTI_SPAM ]: translate( 'Akismet {{s}}Anti-spam{{/s}}', {
			components: {
				s: <span style={ { whiteSpace: 'nowrap' } } />,
			},
		} ),
		[ PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ]: translate( 'Akismet {{s}}Anti-spam{{/s}}', {
			components: {
				s: <span style={ { whiteSpace: 'nowrap' } } />,
			},
		} ),
		[ PRODUCT_JETPACK_VIDEOPRESS ]: translate( 'VideoPress' ),
		[ PRODUCT_JETPACK_VIDEOPRESS_MONTHLY ]: translate( 'VideoPress' ),
		[ PRODUCT_JETPACK_SOCIAL_BASIC ]: translate( 'Social', { context: 'Jetpack product name' } ),
		[ PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY ]: translate( 'Social', {
			context: 'Jetpack product name',
		} ),
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED ]: translate( 'Social', { context: 'Jetpack product name' } ),
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY ]: translate( 'Social', {
			context: 'Jetpack product name',
		} ),
		[ PRODUCT_JETPACK_AI_MONTHLY ]: translate( 'AI' ),
	};
};

export const getJetpackProductsDisplayNames = (): Record< string, TranslateResult > => {
	const backupDaily = translate( 'VaultPress Backup {{em}}Daily{{/em}}', {
		components: {
			em: <em />,
		},
	} );
	const backupRealtime = (
		<>
			{ translate( 'VaultPress Backup {{em}}Real-time{{/em}}', {
				components: {
					em: <em style={ { whiteSpace: 'nowrap' } } />,
				},
			} ) }
		</>
	);
	const backup = translate( 'VaultPress Backup' );
	const search = translate( 'Site Search' );
	const stats = translate( 'Stats' );
	const statsFree = translate( 'Stats (Free)' );
	const statsCommercial = translate( 'Stats (Commercial)' );
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
	const videoPress = translate( 'VideoPress' );
	const aiAssistant = translate( 'AI' );
	const antiSpam = translate( 'Akismet {{s}}Anti-spam{{/s}}', {
		components: {
			s: <span style={ { whiteSpace: 'nowrap' } } />,
		},
	} );
	const boost = translate( 'Boost' );
	const socialBasic = translate( 'Social', { context: 'Jetpack product name' } );
	const socialAdvanced = translate( 'Social', { context: 'Jetpack product name' } );

	const text10gb = translate( '%(numberOfGigabytes)dGB', '%(numberOfGigabytes)dGB', {
		comment:
			'Displays an amount of gigabytes. Plural string used in case GB needs to be pluralized.',
		count: 10,
		args: { numberOfGigabytes: 10 },
	} );

	const text100gb = translate( '%(numberOfGigabytes)dGB', '%(numberOfGigabytes)dGB', {
		comment:
			'Displays an amount of gigabytes. Plural string used in case GB needs to be pluralized.',
		count: 100,
		args: { numberOfGigabytes: 100 },
	} );

	const text1tb = translate( '%(numberOfTerabytes)dTB', '%(numberOfTerabytes)dTB', {
		comment:
			'Displays an amount of terabytes. Plural string used in case TB needs to be pluralized.',
		count: 1,
		args: { numberOfTerabytes: 1 },
	} );
	const text3tb = translate( '%(numberOfTerabytes)dTB', '%(numberOfTerabytes)dTB', {
		comment:
			'Displays an amount of terabytes. Plural string used in case TB needs to be pluralized.',
		count: 3,
		args: { numberOfTerabytes: 3 },
	} );
	const text5tb = translate( '%(numberOfTerabytes)dTB', '%(numberOfTerabytes)dTB', {
		comment:
			'Displays an amount of terabytes. Plural string used in case TB needs to be pluralized.',
		count: 5,
		args: { numberOfTerabytes: 5 },
	} );

	//Backup Add-on products
	const backupAddon10gb = translate( 'VaultPress Backup Add-on Storage (%(storageAmount)s)', {
		args: { storageAmount: text10gb },
	} );
	const backupAddon100gb = translate( 'VaultPress Backup Add-on Storage (%(storageAmount)s)', {
		args: { storageAmount: text100gb },
	} );
	const backupAddon1tb = translate( 'VaultPress Backup Add-on Storage (%(storageAmount)s)', {
		args: { storageAmount: text1tb },
	} );
	const backupAddon3tb = translate( 'VaultPress Backup Add-on Storage (%(storageAmount)s)', {
		args: { storageAmount: text3tb },
	} );
	const backupAddon5tb = translate( 'VaultPress Backup Add-on Storage (%(storageAmount)s)', {
		args: { storageAmount: text5tb },
	} );

	return {
		[ PRODUCT_JETPACK_AI_MONTHLY ]: aiAssistant,
		[ PRODUCT_JETPACK_BACKUP_DAILY ]: backupDaily,
		[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: backupDaily,
		[ PRODUCT_JETPACK_BACKUP_REALTIME ]: backupRealtime,
		[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: backupRealtime,
		[ PRODUCT_JETPACK_BACKUP_T0_YEARLY ]: backup,
		[ PRODUCT_JETPACK_BACKUP_T0_MONTHLY ]: backup,
		[ PRODUCT_JETPACK_BACKUP_T1_YEARLY ]: backup,
		[ PRODUCT_JETPACK_BACKUP_T1_MONTHLY ]: backup,
		[ PRODUCT_JETPACK_BACKUP_T2_YEARLY ]: backup,
		[ PRODUCT_JETPACK_BACKUP_T2_MONTHLY ]: backup,
		[ PRODUCT_JETPACK_BOOST ]: boost,
		[ PRODUCT_JETPACK_BOOST_MONTHLY ]: boost,
		[ PRODUCT_JETPACK_SEARCH ]: search,
		[ PRODUCT_JETPACK_SEARCH_MONTHLY ]: search,
		[ PRODUCT_WPCOM_SEARCH ]: search,
		[ PRODUCT_WPCOM_SEARCH_MONTHLY ]: search,
		[ PRODUCT_JETPACK_STATS_MONTHLY ]: statsCommercial,
		[ PRODUCT_JETPACK_STATS_PWYW_YEARLY ]: stats,
		[ PRODUCT_JETPACK_STATS_FREE ]: statsFree,
		[ PRODUCT_JETPACK_SCAN ]: scan,
		[ PRODUCT_JETPACK_SCAN_MONTHLY ]: scan,
		[ PRODUCT_JETPACK_SCAN_REALTIME ]: scanRealtime,
		[ PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY ]: scanRealtime,
		[ PRODUCT_JETPACK_VIDEOPRESS ]: videoPress,
		[ PRODUCT_JETPACK_VIDEOPRESS_MONTHLY ]: videoPress,
		[ PRODUCT_JETPACK_ANTI_SPAM ]: antiSpam,
		[ PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ]: antiSpam,
		[ PRODUCT_JETPACK_SOCIAL_BASIC ]: socialBasic,
		[ PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY ]: socialBasic,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED ]: socialAdvanced,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY ]: socialAdvanced,
		[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_MONTHLY ]: backupAddon10gb,
		[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_MONTHLY ]: backupAddon100gb,
		[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_MONTHLY ]: backupAddon1tb,
		[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_3TB_MONTHLY ]: backupAddon3tb,
		[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_5TB_MONTHLY ]: backupAddon5tb,
		[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_YEARLY ]: backupAddon10gb,
		[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_YEARLY ]: backupAddon100gb,
		[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_YEARLY ]: backupAddon1tb,
		[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_3TB_YEARLY ]: backupAddon3tb,
		[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_5TB_YEARLY ]: backupAddon5tb,
	};
};

export const getJetpackProductsCallToAction = (): Record< string, TranslateResult > => {
	const backupDaily = translate( 'Get VaultPress Backup {{em}}Daily{{/em}}', {
		components: {
			em: <em />,
		},
	} );
	const backupRealtime = (
		<>
			{ translate( 'Get VaultPress Backup {{em}}Real-time{{/em}}', {
				components: {
					em: <em style={ { whiteSpace: 'nowrap' } } />,
				},
			} ) }
		</>
	);
	const backup = translate( 'Get VaultPress Backup' );
	const search = translate( 'Get Site Search' );
	const scan = translate( 'Get Scan' );
	const videoPress = translate( 'Get VideoPress' );
	const antiSpam = translate( 'Get Akismet {{s}}Anti-spam{{/s}}', {
		components: {
			s: <span style={ { whiteSpace: 'nowrap' } } />,
		},
	} );
	const boost = translate( 'Get Boost' );
	const aiAssistant = translate( 'Get AI' );
	const social = translate( 'Get Social' );

	return {
		[ PRODUCT_JETPACK_AI_MONTHLY ]: aiAssistant,
		[ PRODUCT_JETPACK_BACKUP_DAILY ]: backupDaily,
		[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: backupDaily,
		[ PRODUCT_JETPACK_BACKUP_REALTIME ]: backupRealtime,
		[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: backupRealtime,
		[ PRODUCT_JETPACK_BACKUP_T0_YEARLY ]: backup,
		[ PRODUCT_JETPACK_BACKUP_T0_MONTHLY ]: backup,
		[ PRODUCT_JETPACK_BACKUP_T1_YEARLY ]: backup,
		[ PRODUCT_JETPACK_BACKUP_T1_MONTHLY ]: backup,
		[ PRODUCT_JETPACK_BACKUP_T2_YEARLY ]: backup,
		[ PRODUCT_JETPACK_BACKUP_T2_MONTHLY ]: backup,
		[ PRODUCT_JETPACK_BOOST ]: boost,
		[ PRODUCT_JETPACK_BOOST_MONTHLY ]: boost,
		[ PRODUCT_JETPACK_SEARCH ]: search,
		[ PRODUCT_JETPACK_SEARCH_MONTHLY ]: search,
		[ PRODUCT_JETPACK_SCAN ]: scan,
		[ PRODUCT_JETPACK_SCAN_MONTHLY ]: scan,
		[ PRODUCT_JETPACK_VIDEOPRESS ]: videoPress,
		[ PRODUCT_JETPACK_VIDEOPRESS_MONTHLY ]: videoPress,
		[ PRODUCT_JETPACK_ANTI_SPAM ]: antiSpam,
		[ PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ]: antiSpam,
		[ PRODUCT_JETPACK_SOCIAL_BASIC ]: social,
		[ PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY ]: social,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED ]: social,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY ]: social,
	};
};

export const getJetpackProductsTaglines = (): Record<
	string,
	{ default: TranslateResult; owned?: TranslateResult }
> => {
	const backupDailyTagline = translate( 'Best for sites with occasional updates' );
	const backupRealtimeTagline = translate( 'Best for sites with frequent updates' );
	const backupOwnedTagline = translate( 'Your site is actively being backed up' );
	const boostTagLine = translate( "Improve your site's performance" );
	const boostOwnedTagLine = translate( 'Your site is optimized with Boost' );
	// TODO: may need copy update
	const aiAssistantTagLine = translate(
		'Experience the ease of crafting content with intuitive and powerful AI.'
	);
	const aiAssistantOwnedTagLine = translate(
		'Your site is equipped with our intuitive and powerful AI.'
	);
	const searchTagline = translate( 'Recommended for sites with lots of products or content' );
	const statsTagline = translate(
		'With Jetpack Stats, you don’t need to be a data scientist to see how your site is performing.'
	);
	const scanTagline = translate( 'Protect your site' );
	const scanOwnedTagline = translate( 'Your site is actively being scanned for malicious threats' );
	const antiSpamTagline = translate( 'Block spam automatically' );
	const videoPressTagLine = translate( 'High-quality, ad-free video for WordPress' );
	const socialTagLine = translate(
		'Easily share your website content on your social media channels'
	);
	//TODO: fill in the actua value.
	const socialAdvancedTagLine = translate(
		'Easily share your website content on your social media channels'
	);
	const backupAddonTagLine = translate(
		'Additional storage for your Jetpack VaultPress Backup plan.'
	);
	const backupAddonOwnedTagLine = translate(
		'Your site has additional storage for Jetpack VaultPress Backup.'
	);
	return {
		[ PRODUCT_JETPACK_AI_MONTHLY ]: {
			default: aiAssistantTagLine,
			owned: aiAssistantOwnedTagLine,
		},
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
		[ PRODUCT_JETPACK_BACKUP_T0_YEARLY ]: {
			default: backupRealtimeTagline,
			owned: backupOwnedTagline,
		},
		[ PRODUCT_JETPACK_BACKUP_T0_MONTHLY ]: {
			default: backupRealtimeTagline,
			owned: backupOwnedTagline,
		},
		[ PRODUCT_JETPACK_BACKUP_T1_BI_YEARLY ]: {
			default: backupRealtimeTagline,
			owned: backupOwnedTagline,
		},
		[ PRODUCT_JETPACK_BACKUP_T1_YEARLY ]: {
			default: backupRealtimeTagline,
			owned: backupOwnedTagline,
		},
		[ PRODUCT_JETPACK_BACKUP_T1_MONTHLY ]: {
			default: backupRealtimeTagline,
			owned: backupOwnedTagline,
		},
		[ PRODUCT_JETPACK_BACKUP_T2_YEARLY ]: {
			default: backupRealtimeTagline,
			owned: backupOwnedTagline,
		},
		[ PRODUCT_JETPACK_BACKUP_T2_MONTHLY ]: {
			default: backupRealtimeTagline,
			owned: backupOwnedTagline,
		},
		[ PRODUCT_JETPACK_BOOST ]: {
			default: boostTagLine,
			owned: boostOwnedTagLine,
		},
		[ PRODUCT_JETPACK_BOOST_MONTHLY ]: {
			default: boostTagLine,
			owned: boostOwnedTagLine,
		},
		[ PRODUCT_JETPACK_SEARCH ]: { default: searchTagline },
		[ PRODUCT_JETPACK_SEARCH_MONTHLY ]: { default: searchTagline },
		[ PRODUCT_WPCOM_SEARCH ]: { default: searchTagline },
		[ PRODUCT_WPCOM_SEARCH_MONTHLY ]: { default: searchTagline },
		[ PRODUCT_JETPACK_STATS_MONTHLY ]: { default: statsTagline },
		[ PRODUCT_JETPACK_STATS_PWYW_YEARLY ]: { default: statsTagline },
		[ PRODUCT_JETPACK_STATS_FREE ]: { default: statsTagline },
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
		[ PRODUCT_JETPACK_VIDEOPRESS ]: { default: videoPressTagLine },
		[ PRODUCT_JETPACK_VIDEOPRESS_MONTHLY ]: { default: videoPressTagLine },
		[ PRODUCT_JETPACK_SOCIAL_BASIC ]: { default: socialTagLine },
		[ PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY ]: { default: socialTagLine },
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED ]: { default: socialAdvancedTagLine },
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY ]: { default: socialAdvancedTagLine },
		[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_MONTHLY ]: {
			default: backupAddonTagLine,
			owned: backupAddonOwnedTagLine,
		},
		[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_MONTHLY ]: {
			default: backupAddonTagLine,
			owned: backupAddonOwnedTagLine,
		},
		[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_MONTHLY ]: {
			default: backupAddonTagLine,
			owned: backupAddonOwnedTagLine,
		},
		[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_YEARLY ]: {
			default: backupAddonTagLine,
			owned: backupAddonOwnedTagLine,
		},
		[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_YEARLY ]: {
			default: backupAddonTagLine,
			owned: backupAddonOwnedTagLine,
		},
		[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_YEARLY ]: {
			default: backupAddonTagLine,
			owned: backupAddonOwnedTagLine,
		},
	};
};

export const getJetpackProductDisclaimers = (
	features: SelectorProductFeaturesItem[],
	link: string
): Record< string, TranslateResult > => {
	const backupDisclaimerFeatureSlugs = [
		'jetpack-1-year-archive-activity-log',
		'jetpack-30-day-archive-activity-log',
	];

	const featureSlugs = features.map( ( feature ) => feature.slug );

	/* Checks if any slugs of featues on the current Product match a set of slugs provided to this function. This determines whether or not to show the disclaimer based on whether the features the disclaimer is for is present */
	const doesProductHaveCompatibleSlug = ( slugsToCheckFor: string[] ) => {
		const combinedFeatureSlugs = featureSlugs.concat( slugsToCheckFor );

		return new Set( combinedFeatureSlugs ).size !== combinedFeatureSlugs.length;
	};

	const getLink = () => {
		if ( link[ 0 ] === '#' ) {
			return <a href={ link }></a>;
		}

		return <a href={ link } target="_blank" rel="noreferrer"></a>;
	};

	const backupDisclaimer = doesProductHaveCompatibleSlug( backupDisclaimerFeatureSlugs ) ? (
		translate( 'Subject to your usage and storage limit. {{link}}Learn more{{/link}}.', {
			components: {
				link: getLink(),
			},
		} )
	) : (
		<></>
	);

	return {
		[ PRODUCT_JETPACK_BACKUP_T0_YEARLY ]: backupDisclaimer,
		[ PRODUCT_JETPACK_BACKUP_T0_MONTHLY ]: backupDisclaimer,
		[ PRODUCT_JETPACK_BACKUP_T1_YEARLY ]: backupDisclaimer,
		[ PRODUCT_JETPACK_BACKUP_T1_MONTHLY ]: backupDisclaimer,
		[ PRODUCT_JETPACK_BACKUP_T2_YEARLY ]: backupDisclaimer,
		[ PRODUCT_JETPACK_BACKUP_T2_MONTHLY ]: backupDisclaimer,
		[ PLAN_JETPACK_SECURITY_T1_YEARLY ]: backupDisclaimer,
		[ PLAN_JETPACK_SECURITY_T1_MONTHLY ]: backupDisclaimer,
		[ PLAN_JETPACK_SECURITY_T2_YEARLY ]: backupDisclaimer,
		[ PLAN_JETPACK_SECURITY_T2_MONTHLY ]: backupDisclaimer,
	};
};

export const getJetpackProductsDescriptions = (): Record< string, TranslateResult > => {
	const backupDailyDescription = translate(
		'Never lose a word, image, page, or time worrying about your site with automated backups & one-click restores.'
	);
	const backupRealtimeDescription = translate(
		'Real-time backups save every change and one-click restores get you back online quickly.'
	);
	const backupDescription = translate(
		'Save every change with real-time backups and get back online quickly with one-click restores.'
	);
	// TODO: may need copy update
	const aiAssistantDescription = translate(
		'Experience the ease of crafting content with intuitive and powerful AI.'
	);
	const boostDescription = translate(
		"One-click optimizations that supercharge your WordPress site's performance and improve web vitals scores for better SEO."
	);
	const searchDescription = translate(
		'Help your site visitors find answers instantly so they keep reading and buying. Great for sites with a lot of content.'
	);

	const scanDescription = translate(
		'Automatic scanning and one-click fixes keep your site one step ahead of security threats and malware.'
	);

	const videoPressDescription = translate(
		'High-quality, ad-free video built specifically for WordPress.'
	);

	const antiSpamDescription = translate(
		'Save time and get better responses by automatically blocking spam from your comments and forms.'
	);

	const socialDescription = translate(
		'Easily share your website content on your social media channels from one place.'
	);

	//TODO: fill in the right value.
	const socialAdvancedDescription = translate(
		'Easily share your website content on your social media channels from one place.'
	);

	return {
		[ PRODUCT_JETPACK_AI_MONTHLY ]: aiAssistantDescription,
		[ PRODUCT_JETPACK_BACKUP_DAILY ]: backupDailyDescription,
		[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: backupDailyDescription,
		[ PRODUCT_JETPACK_BACKUP_REALTIME ]: backupRealtimeDescription,
		[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: backupRealtimeDescription,
		[ PRODUCT_JETPACK_BACKUP_T0_YEARLY ]: backupDescription,
		[ PRODUCT_JETPACK_BACKUP_T0_MONTHLY ]: backupDescription,
		[ PRODUCT_JETPACK_BACKUP_T1_YEARLY ]: backupDescription,
		[ PRODUCT_JETPACK_BACKUP_T1_MONTHLY ]: backupDescription,
		[ PRODUCT_JETPACK_BACKUP_T2_YEARLY ]: backupDescription,
		[ PRODUCT_JETPACK_BACKUP_T2_MONTHLY ]: backupDescription,
		[ PRODUCT_JETPACK_BOOST ]: boostDescription,
		[ PRODUCT_JETPACK_BOOST_MONTHLY ]: boostDescription,
		[ PRODUCT_JETPACK_SEARCH ]: searchDescription,
		[ PRODUCT_JETPACK_SEARCH_MONTHLY ]: searchDescription,
		[ PRODUCT_JETPACK_SCAN ]: scanDescription,
		[ PRODUCT_JETPACK_SCAN_MONTHLY ]: scanDescription,
		[ PRODUCT_JETPACK_SCAN_REALTIME ]: scanDescription,
		[ PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY ]: scanDescription,
		[ PRODUCT_JETPACK_VIDEOPRESS ]: videoPressDescription,
		[ PRODUCT_JETPACK_VIDEOPRESS_MONTHLY ]: videoPressDescription,
		[ PRODUCT_JETPACK_ANTI_SPAM ]: antiSpamDescription,
		[ PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ]: antiSpamDescription,
		[ PRODUCT_JETPACK_SOCIAL_BASIC ]: socialDescription,
		[ PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY ]: socialDescription,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED ]: socialAdvancedDescription,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY ]: socialAdvancedDescription,
	};
};

export const getJetpackProductsShortDescriptions = (): Record< string, TranslateResult > => {
	const backupDailyShortDescription = translate(
		'Automated daily backups with one-click restores.'
	);
	const backupRealtimeShortDescription = translate(
		'Real-time cloud backups with one-click restores.'
	);
	const backupShortDescription = translate(
		'Real-time cloud backups with one-click restores. Starts with %(amount)s.',
		{
			args: { amount: '10GB' },
			comment: '%s is a storage amount like 1TB or 10GB',
		}
	);
	const aiAssistantShortDescription = translate(
		'Experience the ease of crafting content with intuitive and powerful AI.'
	);
	const boostShortDescription = translate(
		'Speed up your site and improve SEO - no developer required.'
	);
	const searchShortDescription = translate( 'Help your site visitors find answers instantly.' );
	const scanShortDescription = translate( '24/7 protection: WAF and automatic malware scanning.' );
	const videoPressShortDescription = translate(
		'High-quality, ad-free video built specifically for WordPress.'
	);
	const antiSpamShortDescription = translate(
		'Automatically clear spam from your comments and forms.'
	);
	const socialShortDescription = translate( 'Write once, post everywhere.' );
	//TODO: Fill in the right value.
	const socialAdvancedShortDescription = translate( 'Write once, post everywhere.' );

	return {
		[ PRODUCT_JETPACK_AI_MONTHLY ]: aiAssistantShortDescription,
		[ PRODUCT_JETPACK_BACKUP_DAILY ]: backupDailyShortDescription,
		[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: backupDailyShortDescription,
		[ PRODUCT_JETPACK_BACKUP_REALTIME ]: backupRealtimeShortDescription,
		[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: backupRealtimeShortDescription,
		[ PRODUCT_JETPACK_BACKUP_T0_YEARLY ]: backupShortDescription,
		[ PRODUCT_JETPACK_BACKUP_T0_MONTHLY ]: backupShortDescription,
		[ PRODUCT_JETPACK_BACKUP_T1_YEARLY ]: backupShortDescription,
		[ PRODUCT_JETPACK_BACKUP_T1_MONTHLY ]: backupShortDescription,
		[ PRODUCT_JETPACK_BACKUP_T2_YEARLY ]: backupShortDescription,
		[ PRODUCT_JETPACK_BACKUP_T2_MONTHLY ]: backupShortDescription,
		[ PRODUCT_JETPACK_BOOST ]: boostShortDescription,
		[ PRODUCT_JETPACK_BOOST_MONTHLY ]: boostShortDescription,
		[ PRODUCT_JETPACK_SEARCH ]: searchShortDescription,
		[ PRODUCT_JETPACK_SEARCH_MONTHLY ]: searchShortDescription,
		[ PRODUCT_JETPACK_SCAN ]: scanShortDescription,
		[ PRODUCT_JETPACK_SCAN_MONTHLY ]: scanShortDescription,
		[ PRODUCT_JETPACK_SCAN_REALTIME ]: scanShortDescription,
		[ PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY ]: scanShortDescription,
		[ PRODUCT_JETPACK_VIDEOPRESS ]: videoPressShortDescription,
		[ PRODUCT_JETPACK_VIDEOPRESS_MONTHLY ]: videoPressShortDescription,
		[ PRODUCT_JETPACK_ANTI_SPAM ]: antiSpamShortDescription,
		[ PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ]: antiSpamShortDescription,
		[ PRODUCT_JETPACK_SOCIAL_BASIC ]: socialShortDescription,
		[ PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY ]: socialShortDescription,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED ]: socialAdvancedShortDescription,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY ]: socialAdvancedShortDescription,
	};
};

export const getJetpackProductsFeaturedDescription = (): Record< string, TranslateResult > => {
	const backupDailyFeaturedText = translate(
		'Never lose a word, image, page, or time worrying about your site with automated daily backups & one-click restores.'
	);
	const backupFeaturedText = translate(
		'Protect your site or store. Save every change with real-time cloud backups, and restore in one click.'
	);
	const videoPressFeaturedText = translate(
		'Own your content. High-quality, ad-free video built specifically for WordPress.'
	);
	const antiSpamFeaturedText = translate(
		'Stop spam in comments and forms. Save time through automation and get rid of annoying CAPTCHAs.'
	);
	const scanFeaturedText = translate(
		'Stay ahead of security threats. Automatic scanning and one-click fixes give you and your customers peace of mind.'
	);
	const searchFeaturedText = translate(
		'Instant search helps your visitors actually find what they need and improves conversion.'
	);
	// TODO: may need alternate copy here
	const aiAssistantFeaturedText = translate(
		'Utilizing the potential of artificial intelligence, Jetpack AI brings a supportive layer to your content creation process.'
	);
	const boostFeaturedText = translate(
		'Instant speed and SEO boost. Get the same advantages as the top sites, no developer required.'
	);
	const socialFeaturedText = translate(
		'Write once, post everywhere. Easily share your content on social media from WordPress.'
	);
	//TODO: fill in the right value.
	const socialAdvancedFeaturedText = translate(
		'Write once, post everywhere. Easily share your content on social media from WordPress.'
	);

	return {
		[ PRODUCT_JETPACK_AI_MONTHLY ]: aiAssistantFeaturedText,
		[ PRODUCT_JETPACK_BACKUP_DAILY ]: backupDailyFeaturedText,
		[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: backupDailyFeaturedText,
		[ PRODUCT_JETPACK_BACKUP_REALTIME ]: backupFeaturedText,
		[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: backupFeaturedText,
		[ PRODUCT_JETPACK_BACKUP_T0_YEARLY ]: backupFeaturedText,
		[ PRODUCT_JETPACK_BACKUP_T0_MONTHLY ]: backupFeaturedText,
		[ PRODUCT_JETPACK_BACKUP_T1_YEARLY ]: backupFeaturedText,
		[ PRODUCT_JETPACK_BACKUP_T1_MONTHLY ]: backupFeaturedText,
		[ PRODUCT_JETPACK_BACKUP_T2_YEARLY ]: backupFeaturedText,
		[ PRODUCT_JETPACK_BACKUP_T2_MONTHLY ]: backupFeaturedText,
		[ PRODUCT_JETPACK_VIDEOPRESS ]: videoPressFeaturedText,
		[ PRODUCT_JETPACK_VIDEOPRESS_MONTHLY ]: videoPressFeaturedText,
		[ PRODUCT_JETPACK_ANTI_SPAM ]: antiSpamFeaturedText,
		[ PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ]: antiSpamFeaturedText,
		[ PRODUCT_JETPACK_SCAN ]: scanFeaturedText,
		[ PRODUCT_JETPACK_SCAN_MONTHLY ]: scanFeaturedText,
		[ PRODUCT_JETPACK_SCAN_REALTIME ]: scanFeaturedText,
		[ PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY ]: scanFeaturedText,
		[ PRODUCT_JETPACK_SEARCH ]: searchFeaturedText,
		[ PRODUCT_JETPACK_SEARCH_MONTHLY ]: searchFeaturedText,
		[ PRODUCT_JETPACK_BOOST ]: boostFeaturedText,
		[ PRODUCT_JETPACK_BOOST_MONTHLY ]: boostFeaturedText,
		[ PRODUCT_JETPACK_SOCIAL_BASIC ]: socialFeaturedText,
		[ PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY ]: socialFeaturedText,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED ]: socialAdvancedFeaturedText,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY ]: socialAdvancedFeaturedText,
	};
};
export const getJetpackProductsLightboxDescription = (): Record< string, TranslateResult > => {
	const backupDailyLightboxDescription = translate(
		'Protect your site or store with automated daily cloud backups, and restore in one click from anywhere.'
	);
	const backupLightboxDescription = translate(
		'Protect your site or store. Save every change with real-time cloud backups, and restore in one click from anywhere.'
	);
	const videoPressLightboxDescription = translate(
		'Own your content: High-quality, ad-free video built specifically for WordPress.'
	);
	const antiSpamLightboxDescription = translate(
		'Automatically clear spam from your comments and forms.'
	);
	const scanLightboxDescription = translate(
		'Keep your site or store ahead of security threats with our WAF and automated malware scanning, including one-click fixes.'
	);
	const searchLightboxDescription = translate(
		'Incredibly powerful and customizable, Jetpack Search helps your visitors instantly find the right content - right when they need it.'
	);
	const aiAssistantLightboxDescription = translate(
		'Utilizing the potential of artificial intelligence, Jetpack AI brings a supportive layer to your content creation process.'
	);
	const boostLightboxDescription = translate(
		'Jetpack Boost gives your site the same performance advantages as the world’s leading websites, no developer required.'
	);
	const socialLightboxDescription = translate(
		'Easily share your website content on your social media channels from one place.'
	);
	const socialAdvancedLightboxDescription = translate(
		'Easily share your website content on your social media channels from one place. Enjoy using the advanced plan for half price over the next year while we continue to develop the features.'
	);

	return {
		[ PRODUCT_JETPACK_AI_MONTHLY ]: aiAssistantLightboxDescription,
		[ PRODUCT_JETPACK_BACKUP_DAILY ]: backupDailyLightboxDescription,
		[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: backupDailyLightboxDescription,
		[ PRODUCT_JETPACK_BACKUP_REALTIME ]: backupLightboxDescription,
		[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: backupLightboxDescription,
		[ PRODUCT_JETPACK_BACKUP_T0_YEARLY ]: backupLightboxDescription,
		[ PRODUCT_JETPACK_BACKUP_T0_MONTHLY ]: backupLightboxDescription,
		[ PRODUCT_JETPACK_BACKUP_T1_YEARLY ]: backupLightboxDescription,
		[ PRODUCT_JETPACK_BACKUP_T1_MONTHLY ]: backupLightboxDescription,
		[ PRODUCT_JETPACK_BACKUP_T2_YEARLY ]: backupLightboxDescription,
		[ PRODUCT_JETPACK_BACKUP_T2_MONTHLY ]: backupLightboxDescription,
		[ PRODUCT_JETPACK_VIDEOPRESS ]: videoPressLightboxDescription,
		[ PRODUCT_JETPACK_VIDEOPRESS_MONTHLY ]: videoPressLightboxDescription,
		[ PRODUCT_JETPACK_ANTI_SPAM ]: antiSpamLightboxDescription,
		[ PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ]: antiSpamLightboxDescription,
		[ PRODUCT_JETPACK_SCAN ]: scanLightboxDescription,
		[ PRODUCT_JETPACK_SCAN_MONTHLY ]: scanLightboxDescription,
		[ PRODUCT_JETPACK_SCAN_REALTIME ]: scanLightboxDescription,
		[ PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY ]: scanLightboxDescription,
		[ PRODUCT_JETPACK_SEARCH ]: searchLightboxDescription,
		[ PRODUCT_JETPACK_SEARCH_MONTHLY ]: searchLightboxDescription,
		[ PRODUCT_JETPACK_BOOST ]: boostLightboxDescription,
		[ PRODUCT_JETPACK_BOOST_MONTHLY ]: boostLightboxDescription,
		[ PRODUCT_JETPACK_SOCIAL_BASIC ]: socialLightboxDescription,
		[ PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY ]: socialLightboxDescription,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED ]: socialAdvancedLightboxDescription,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY ]: socialAdvancedLightboxDescription,
	};
};

export const getJetpackProductsWhatIsIncluded = (): Record< string, Array< TranslateResult > > => {
	const realTimeBackup = translate( 'Real-time backups as you edit' );

	const orderBackups = translate( 'WooCommerce order and table backups' );
	const cloudBackups = translate( 'Redundant cloud backups on our global network' );
	const prioritySupport = translate( 'Priority support' );

	const backupIncludesInfoT0Storage = translate( '1GB of cloud storage' );
	const backupIncludesInfoT1Storage = translate( '10GB of cloud storage' );
	const backupIncludesInfoT2Storage = translate(
		'{{strong}}1TB (1,000GB){{/strong}} of cloud storage',
		{
			components: {
				strong: <strong />,
			},
		}
	);

	const backupIncludesInfoT1Log = translate( '30-day activity log archive' );
	const backupIncludesInfoT2Log = translate( '{{strong}}1 year{{/strong}} activity log archive', {
		components: {
			strong: <strong />,
		},
	} );

	const oneClickRestoreT1 = translate( 'Unlimited one-click restores from the last 30 days' );
	const oneClickRestoreT2 = translate(
		'Unlimited one-click restores from the last {{strong}}1 year{{/strong}}',
		{
			components: {
				strong: <strong />,
			},
		}
	);

	const otherIncludes = [ orderBackups, cloudBackups, prioritySupport ];
	const backupIncludesInfoT0 = [
		realTimeBackup,
		backupIncludesInfoT0Storage,
		backupIncludesInfoT1Log,
		oneClickRestoreT1,
		...otherIncludes,
	];
	const backupIncludesInfoT1 = [
		realTimeBackup,
		backupIncludesInfoT1Storage,
		backupIncludesInfoT1Log,
		oneClickRestoreT1,
		...otherIncludes,
	];
	const backupIncludesInfoT2 = [
		realTimeBackup,
		backupIncludesInfoT2Storage,
		backupIncludesInfoT2Log,
		oneClickRestoreT2,
		...otherIncludes,
	];

	const videoPressIncludesInfo = [
		translate( '1TB of cloud-hosted video' ),
		translate( 'Customizable video player' ),
		translate( 'Fast-motion video with 60 FPS and 4K resolution' ),
		translate( 'Global CDN' ),
		translate( 'Powerful and reliable hosting infrastructure' ),
		translate( 'Video and story blocks' ),
		translate( 'Unlimited logins for team members' ),
	];
	const antiSpamIncludesInfo = [
		translate( 'Comment and form spam protection' ),
		translate( '10K API calls per month' ),
		translate( 'Akismet technology - 500B+ spam comments blocked to date' ),
		translate( 'Flexible API that works with any type of site' ),
	];
	const scanIncludesInfo = [
		translate( 'Website firewall (WAF)' ),
		translate( 'Automated daily scanning' ),
		translate( 'One-click fixes for most issues' ),
		translate( 'Instant email threat notifications' ),
		translate( 'Priority support' ),
	];
	const searchIncludesInfo = [
		translate( 'Instant search, filtering, and indexing' ),
		translate( 'Highly relevant search results' ),
		translate( 'Supports 38 languages' ),
		translate( 'Quick and accurate spelling correction' ),
	];
	const boostIncludesInfo = [
		translate( '{{strong}}Automated critical CSS{{/strong}}', {
			components: {
				strong: <strong />,
			},
		} ),
		translate( 'Site performance scores' ),
		translate( 'One-click optimization' ),
		translate( 'Defer non-essential JavaScript' ),
		translate( 'Optimize CSS loading' ),
		translate( 'Lazy image loading' ),
		translate( 'Image Guide to discover and fix large images on your site' ),
	];
	const socialBasicIncludesInfo = [
		translate( 'Automatically share your posts and products on social media' ),
		translate( 'Post to multiple channels at once' ),
		translate( 'Manage all of your channels from a single hub' ),
		translate( 'Scheduled posts' ),
		translate( 'Share to Facebook, Instagram, LinkedIn, Mastodon & Tumblr' ),
		translate( 'Recycle content' ),
	];
	const socialAdvancedIncludesInfo = [
		translate( 'Automatically share your posts and products on social media' ),
		translate( 'Post to multiple channels at once' ),
		translate( 'Manage all of your channels from a single hub' ),
		translate( 'Scheduled posts' ),
		translate( 'Share to Facebook, Instagram, LinkedIn, Mastodon & Tumblr' ),
		translate( 'Engagement Optimizer' ),
		translate( 'Recycle content' ),
		translate( 'Image generator' ),
	];
	const aiAssistantIncludesInfo = [
		translate( 'Prompt based content generation' ),
		translate( 'Generate text, tables, and lists' ),
		translate( 'Adaptive Tone Adjustment' ),
		translate( 'Superior spelling and Grammar Correction' ),
		translate( 'Title & summary generation' ),
	];

	return {
		[ PRODUCT_JETPACK_AI_MONTHLY ]: aiAssistantIncludesInfo,
		[ PRODUCT_JETPACK_BACKUP_T0_YEARLY ]: backupIncludesInfoT0,
		[ PRODUCT_JETPACK_BACKUP_T0_MONTHLY ]: backupIncludesInfoT0,
		[ PRODUCT_JETPACK_BACKUP_DAILY ]: backupIncludesInfoT1,
		[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: backupIncludesInfoT1,
		[ PRODUCT_JETPACK_BACKUP_REALTIME ]: backupIncludesInfoT1,
		[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: backupIncludesInfoT1,
		[ PRODUCT_JETPACK_BACKUP_T1_YEARLY ]: backupIncludesInfoT1,
		[ PRODUCT_JETPACK_BACKUP_T1_MONTHLY ]: backupIncludesInfoT1,
		[ PRODUCT_JETPACK_BACKUP_T2_YEARLY ]: backupIncludesInfoT2,
		[ PRODUCT_JETPACK_BACKUP_T2_MONTHLY ]: backupIncludesInfoT2,
		[ PRODUCT_JETPACK_VIDEOPRESS ]: videoPressIncludesInfo,
		[ PRODUCT_JETPACK_VIDEOPRESS_MONTHLY ]: videoPressIncludesInfo,
		[ PRODUCT_JETPACK_ANTI_SPAM ]: antiSpamIncludesInfo,
		[ PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ]: antiSpamIncludesInfo,
		[ PRODUCT_JETPACK_SCAN ]: scanIncludesInfo,
		[ PRODUCT_JETPACK_SCAN_MONTHLY ]: scanIncludesInfo,
		[ PRODUCT_JETPACK_SCAN_REALTIME ]: scanIncludesInfo,
		[ PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY ]: scanIncludesInfo,
		[ PRODUCT_JETPACK_SEARCH ]: searchIncludesInfo,
		[ PRODUCT_JETPACK_SEARCH_MONTHLY ]: searchIncludesInfo,
		[ PRODUCT_JETPACK_BOOST ]: boostIncludesInfo,
		[ PRODUCT_JETPACK_BOOST_MONTHLY ]: boostIncludesInfo,
		[ PRODUCT_JETPACK_SOCIAL_BASIC ]: socialBasicIncludesInfo,
		[ PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY ]: socialBasicIncludesInfo,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED ]: socialAdvancedIncludesInfo,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY ]: socialAdvancedIncludesInfo,
	};
};

export const getJetpackProductsWhatIsIncludedComingSoon = (): Record<
	string,
	Array< TranslateResult >
> => {
	const socialAdvancedIncludesInfo = [ translate( 'Multi-image sharing' ) ];

	return {
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED ]: socialAdvancedIncludesInfo,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY ]: socialAdvancedIncludesInfo,
	};
};

export const getJetpackProductsBenefits = (): Record< string, Array< TranslateResult > > => {
	const backupBenefits = [
		translate( 'Protect your revenue stream and content' ),
		translate( 'Restore your site in one click from desktop or mobile' ),
		translate( 'Restore or clone offline sites' ),
		translate( 'Fix your site without a developer' ),
		translate( 'Protect Woo order and customer data' ),
		translate( 'Best-in-class support from WordPress experts' ),
	];

	const scanBenefits = [
		translate( 'Protect your revenue stream and content' ),
		translate( 'Learn about issues before your customers are impacted' ),
		translate( 'Fix most issues in one click from desktop or mobile' ),
		translate( 'Best-in-class support from WordPress experts' ),
	];
	const antiSpamBenefits = [
		translate( 'Set up in minutes without a developer' ),
		translate( 'Save time manually reviewing spam' ),
		translate( 'Increase engagement by removing CAPTCHAs' ),
		translate( 'Best-in-class support from WordPress experts' ),
	];
	const videoPressBenefits = [
		translate( 'Increase engagement and get your message across' ),
		translate( 'Drag and drop videos through the WordPress editor' ),
		translate( 'Manage videos in the WordPress media library' ),
		translate( 'Remove distracting ads' ),
		translate( 'Customizable colors to fit your brand and site' ),
		translate( 'Best-in-class support from WordPress experts' ),
	];

	const searchBenefits = [
		translate( "Customizable to fit your site's design" ),
		translate( 'Increase conversion with accurate search results' ),
		translate( 'Tiered pricing - pay for only what you need' ),
		translate( 'No developer required' ),
		translate( 'Best-in-class support from WordPress experts' ),
	];

	const boostBenefits = [
		translate( 'Quickly test and improve your site speed' ),
		translate( "Improve your site's SEO" ),
		translate( 'Get faster FCP and LCP' ),
		translate( 'No developer required' ),
		translate( 'Best-in-class support from WordPress experts' ),
	];

	const socialBenefits = [
		translate( 'Save time by sharing your posts automatically' ),
		translate( 'Unlock your growth potential by building a following on social media' ),
		translate( 'Easy-to-use interface' ),
		translate( 'No developer required' ),
		translate( 'Repurpose, reuse or republish already published content' ),
	];

	const socialAdvancedBenefits = [
		translate( 'Save time by sharing your posts automatically' ),
		translate( 'Unlock your growth potential by building a following on social media' ),
		translate( 'Easy-to-use interface' ),
		translate( 'No developer required' ),
		translate( 'Enhance social media engagement with personalized posts' ),
		translate( 'Upload & automatically share images and videos to social media' ),
		translate( 'Automatically create custom images, saving you hours of tedious work' ),
		translate( 'Repurpose, reuse or republish already published content' ),
	];

	const aiAssistantBenefits = [
		translate( 'Harness AI Power Directly from Your Editor' ),
		translate( 'Unlock High‑Quality, Tailored Content at Your Command' ),
		translate( 'Maintain Professional Standards with Ease' ),
		translate( 'Best in-class support from WordPress experts' ),
	];

	return {
		[ PRODUCT_JETPACK_AI_MONTHLY ]: aiAssistantBenefits,
		[ PRODUCT_JETPACK_BACKUP_DAILY ]: backupBenefits,
		[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: backupBenefits,
		[ PRODUCT_JETPACK_BACKUP_REALTIME ]: backupBenefits,
		[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: backupBenefits,
		[ PRODUCT_JETPACK_BACKUP_T0_YEARLY ]: backupBenefits,
		[ PRODUCT_JETPACK_BACKUP_T0_MONTHLY ]: backupBenefits,
		[ PRODUCT_JETPACK_BACKUP_T1_YEARLY ]: backupBenefits,
		[ PRODUCT_JETPACK_BACKUP_T1_MONTHLY ]: backupBenefits,
		[ PRODUCT_JETPACK_BACKUP_T2_YEARLY ]: backupBenefits,
		[ PRODUCT_JETPACK_BACKUP_T2_MONTHLY ]: backupBenefits,
		[ PRODUCT_JETPACK_VIDEOPRESS ]: videoPressBenefits,
		[ PRODUCT_JETPACK_VIDEOPRESS_MONTHLY ]: videoPressBenefits,
		[ PRODUCT_JETPACK_ANTI_SPAM ]: antiSpamBenefits,
		[ PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ]: antiSpamBenefits,
		[ PRODUCT_JETPACK_SCAN ]: scanBenefits,
		[ PRODUCT_JETPACK_SCAN_MONTHLY ]: scanBenefits,
		[ PRODUCT_JETPACK_SCAN_REALTIME ]: scanBenefits,
		[ PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY ]: scanBenefits,
		[ PRODUCT_JETPACK_SEARCH ]: searchBenefits,
		[ PRODUCT_JETPACK_SEARCH_MONTHLY ]: searchBenefits,
		[ PRODUCT_JETPACK_BOOST ]: boostBenefits,
		[ PRODUCT_JETPACK_BOOST_MONTHLY ]: boostBenefits,
		[ PRODUCT_JETPACK_SOCIAL_BASIC ]: socialBenefits,
		[ PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY ]: socialBenefits,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED ]: socialAdvancedBenefits,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY ]: socialAdvancedBenefits,
	};
};

export const getJetpackProductsBenefitsComingSoon = (): Record<
	string,
	Array< TranslateResult >
> => {
	const socialAdvancedBenefits = [ translate( 'Share multiple images to social media' ) ];

	return {
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED ]: socialAdvancedBenefits,
		[ PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY ]: socialAdvancedBenefits,
	};
};

export const getJetpackProductsFAQs = (
	getHelpLink: ( context: unknown ) => JSX.Element,
	getSupportLink: ( context: unknown ) => JSX.Element
): Record< string, Array< FAQ > > => {
	const cancellationPolicyFAQ = {
		id: 'cancellation-policy',
		question: translate( 'What is your cancellation policy?' ),
		answer: translate(
			'If you are dissatisfied for any reason, we offer full refunds within %(annualDays)d days for yearly plans, and within %(monthlyDays)d days for monthly plans. If you have a question about our paid plans, {{helpLink}}please let us know{{/helpLink}}!',
			{
				args: { annualDays: 14, monthlyDays: 7 },
				components: { helpLink: getHelpLink( 'cancellation' ) },
			}
		),
	};

	const backupFAQs: Array< FAQ > = [
		{
			id: 'backup-storage-limits',
			question: translate( 'How do backup storage limits work?' ),
			answer: translate(
				'If your backup storage limit is reached, older backups will be deleted and, depending on your site’s size, the backup retention period (archive) might be reduced to %(monthlyDays)d days. This will affect how far back you can see backups in your activity log. Existing backups can still be restored, but new updates won’t be backed up until you upgrade or free up storage.',
				{
					args: { monthlyDays: 7 },
				}
			),
		},
		cancellationPolicyFAQ,
	];

	const scanFAQs: Array< FAQ > = [
		{
			id: 'scan-infected-sites',
			question: translate( 'Can I use Jetpack Scan to fix a site that is already infected?' ),
			answer: translate(
				'Jetpack Protect (Scan) detects and prevents attacks, but is not designed to fully clean up sites infected before it was active. If your site has malware, take immediate action to clean it up and remove the malicious code. {{br/}} To clean up your site, we suggest using a malware removal tool, or if possible restore from a backup taken before the infection. We recommend using Jetpack VaultPress Backup in conjunction with Jetpack Scan to secure your website. {{br/}} {{JetpackScanLearnMoreLink}}Learn more about cleaning your site{{/JetpackScanLearnMoreLink}}.',
				{
					components: {
						br: <br />,
						JetpackScanLearnMoreLink: getSupportLink( 'how-to-clean-your-hacked-wordpress-site' ),
					},
				}
			),
		},
		cancellationPolicyFAQ,
	];

	return {
		[ PLAN_JETPACK_SECURITY_T1_MONTHLY ]: backupFAQs,
		[ PLAN_JETPACK_SECURITY_T1_YEARLY ]: backupFAQs,
		[ PLAN_JETPACK_SECURITY_T2_MONTHLY ]: backupFAQs,
		[ PLAN_JETPACK_SECURITY_T2_YEARLY ]: backupFAQs,
		[ PLAN_JETPACK_COMPLETE ]: backupFAQs,
		[ PLAN_JETPACK_COMPLETE_MONTHLY ]: backupFAQs,
		[ PRODUCT_JETPACK_BACKUP_T1_MONTHLY ]: backupFAQs,
		[ PRODUCT_JETPACK_BACKUP_T1_YEARLY ]: backupFAQs,
		[ PRODUCT_JETPACK_BACKUP_T2_MONTHLY ]: backupFAQs,
		[ PRODUCT_JETPACK_BACKUP_T2_YEARLY ]: backupFAQs,
		[ PRODUCT_JETPACK_SCAN ]: scanFAQs,
		[ PRODUCT_JETPACK_SCAN_MONTHLY ]: scanFAQs,
	};
};

export const getJetpackPlansAlsoIncludedFeatures = (): Record<
	string,
	Array< TranslateResult >
> => {
	const socialFree = [ translate( 'Social (free tier)' ) ];
	const videoPressFree = [ translate( 'VideoPress (free tier)' ) ];
	const freeBundleFeatures = [
		translate( 'Brute force attack protection' ),
		translate( 'Downtime monitoring' ),
		translate( 'CDN (Content Delivery Networks)' ),
		translate( 'Stats' ),
	];

	return {
		[ PLAN_JETPACK_SECURITY_T1_MONTHLY ]: [
			...socialFree,
			...videoPressFree,
			...freeBundleFeatures,
		],
		[ PLAN_JETPACK_SECURITY_T1_YEARLY ]: [
			...socialFree,
			...videoPressFree,
			...freeBundleFeatures,
		],
		[ PLAN_JETPACK_SECURITY_T2_MONTHLY ]: [
			...socialFree,
			...videoPressFree,
			...freeBundleFeatures,
		],
		[ PLAN_JETPACK_SECURITY_T2_YEARLY ]: [
			...socialFree,
			...videoPressFree,
			...freeBundleFeatures,
		],
		[ PLAN_JETPACK_COMPLETE ]: [ ...freeBundleFeatures ],
		[ PLAN_JETPACK_COMPLETE_MONTHLY ]: [ ...freeBundleFeatures ],
	};
};

export const getJetpackProductsRecommendedFor = (): Record< string, TranslateResult > => {
	return {
		[ JETPACK_TAG_FOR_WOOCOMMERCE_STORES ]: translate( 'WooCommerce stores' ),
		[ JETPACK_TAG_FOR_NEWS_ORGANISATIONS ]: translate( 'News organizations' ),
		[ JETPACK_TAG_FOR_MEMBERSHIP_SITES ]: translate( 'Membership sites' ),
		[ JETPACK_TAG_FOR_ONLINE_FORUMS ]: translate( 'Online forums' ),
		[ JETPACK_TAG_FOR_BLOGS ]: translate( 'Blogs' ),
		[ JETPACK_TAG_FOR_VIDEOGRAPHERS ]: translate( 'Videographers' ),
		[ JETPACK_TAG_FOR_EDUCATORS ]: translate( 'Educators' ),
		[ JETPACK_TAG_FOR_BLOGGERS ]: translate( 'Bloggers' ),
		[ JETPACK_TAG_FOR_ALL_SITES ]: translate( 'All sites' ),
	};
};

export const useJetpack10GbStorageAmountText = (): TranslateResult => {
	const translate = useTranslate();

	return useMemo(
		() =>
			translate( '%(numberOfGigabytes)dGB', '%(numberOfGigabytes)dGB', {
				comment:
					'Displays an amount of gigabytes. Plural string used in case GB needs to be pluralized.',
				count: 10,
				args: { numberOfGigabytes: 10 },
			} ),
		[ translate ]
	);
};

export const useJetpack100GbStorageAmountText = (): TranslateResult => {
	const translate = useTranslate();

	return useMemo(
		() =>
			translate( '%(numberOfGigabytes)dGB', '%(numberOfGigabytes)dGB', {
				comment:
					'Displays an amount of gigabytes. Plural string used in case GB needs to be pluralized.',
				count: 100,
				args: { numberOfGigabytes: 100 },
			} ),
		[ translate ]
	);
};

export const useJetpack1TbStorageAmountText = (): TranslateResult => {
	const translate = useTranslate();

	return useMemo(
		() =>
			translate( '%(numberOfTerabytes)dTB', '%(numberOfTerabytes)dTB', {
				comment:
					'Displays an amount of terabytes. Plural string used in case TB needs to be pluralized.',
				count: 1,
				args: { numberOfTerabytes: 1 },
			} ),
		[ translate ]
	);
};

export const useJetpackGbStorageAmountText = ( amount: number ): TranslateResult => {
	const translate = useTranslate();

	return useMemo(
		() =>
			translate( '%(numberOfGigabytes)dGB', '%(numberOfGigabytes)dGB', {
				comment:
					'Displays an amount of gigabytes. Plural string used in case GB needs to be pluralized.',
				count: amount,
				args: { numberOfGigabytes: amount },
			} ),
		[ translate, amount ]
	);
};

export const useJetpackTbStorageAmountText = ( amount: number ): TranslateResult => {
	const translate = useTranslate();

	return useMemo(
		() =>
			translate( '%(numberOfTerabytes)dTB', '%(numberOfTerabytes)dTB', {
				comment:
					'Displays an amount of terabytes. Plural string used in case TB needs to be pluralized.',
				count: amount,
				args: { numberOfTerabytes: amount },
			} ),
		[ translate, amount ]
	);
};

export const useJetpackStorageAmountTextByProductSlug = (): ( (
	slug: string
) => TranslateResult | undefined ) => {
	const ONE_GIGABYTE = useJetpackGbStorageAmountText( 1 );
	const TEN_GIGABYTES = useJetpackGbStorageAmountText( 10 );
	const HUNDRED_GIGABYTES = useJetpackGbStorageAmountText( 100 );
	const ONE_TERABYTE = useJetpackTbStorageAmountText( 1 );
	const THREE_TERABYTE = useJetpackTbStorageAmountText( 3 );
	const FIVE_TERABYTE = useJetpackTbStorageAmountText( 5 );

	return useCallback(
		( productSlug ) =>
			( {
				[ PRODUCT_JETPACK_BACKUP_T0_MONTHLY ]: ONE_GIGABYTE,
				[ PRODUCT_JETPACK_BACKUP_T0_YEARLY ]: ONE_GIGABYTE,
				[ PRODUCT_JETPACK_BACKUP_T1_MONTHLY ]: TEN_GIGABYTES,
				[ PRODUCT_JETPACK_BACKUP_T1_YEARLY ]: TEN_GIGABYTES,
				[ PRODUCT_JETPACK_BACKUP_T2_MONTHLY ]: ONE_TERABYTE,
				[ PRODUCT_JETPACK_BACKUP_T2_YEARLY ]: ONE_TERABYTE,
				[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_MONTHLY ]: TEN_GIGABYTES,
				[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_MONTHLY ]: HUNDRED_GIGABYTES,
				[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_MONTHLY ]: ONE_TERABYTE,
				[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_3TB_MONTHLY ]: THREE_TERABYTE,
				[ PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_5TB_MONTHLY ]: FIVE_TERABYTE,

				[ PLAN_JETPACK_SECURITY_T1_MONTHLY ]: TEN_GIGABYTES,
				[ PLAN_JETPACK_SECURITY_T1_YEARLY ]: TEN_GIGABYTES,
				[ PLAN_JETPACK_SECURITY_T2_MONTHLY ]: ONE_TERABYTE,
				[ PLAN_JETPACK_SECURITY_T2_YEARLY ]: ONE_TERABYTE,
			}[ productSlug ] ),
		[ ONE_GIGABYTE, TEN_GIGABYTES, HUNDRED_GIGABYTES, ONE_TERABYTE, THREE_TERABYTE, FIVE_TERABYTE ]
	);
};
