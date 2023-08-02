import config from '@automattic/calypso-config';
import { translate } from 'i18n-calypso';
import moment from 'moment';
import { urlToSlug } from 'calypso/lib/url';
import type {
	AllowedTypes,
	SiteData,
	Site,
	StatusEventNames,
	ActionEventNames,
	AllowedStatusTypes,
	AllowedActionTypes,
	StatusTooltip,
	RowMetaData,
	StatsNode,
	BoostNode,
	BackupNode,
	ScanNode,
	MonitorNode,
	SiteColumns,
	Backup,
} from './types';

const INITIAL_UNIX_EPOCH = '1970-01-01 00:00:00';

const isBoostEnabled = config.isEnabled( 'jetpack/pro-dashboard-jetpack-boost' );

// Mapping the columns to the site data keys
export const siteColumnKeyMap: { [ key: string ]: string } = {
	site: 'url',
};

const boostColumn: SiteColumns = isBoostEnabled
	? [
			{
				key: 'boost',
				title: translate( 'Boost' ),
				className: 'width-fit-content',
				isExpandable: true,
			},
	  ]
	: [];

export const siteColumns: SiteColumns = [
	{
		key: 'site',
		title: translate( 'Site' ),
		isSortable: true,
	},
	{
		key: 'stats',
		title: translate( 'Stats' ),
		className: 'width-fit-content',
		isExpandable: true,
	},
	...boostColumn,
	{
		key: 'backup',
		title: translate( 'Backup' ),
		className: 'fixed-site-column',
		isExpandable: true,
	},
	{
		key: 'scan',
		title: translate( 'Scan' ),
		className: 'fixed-site-column',
	},
	{
		key: 'monitor',
		title: translate( 'Monitor' ),
		className: 'min-width-100px',
		isExpandable: true,
	},
	{
		key: 'plugin',
		title: translate( 'Plugins' ),
		className: 'width-fit-content',
	},
];

// Event names for all actions for large screen(>960px) and small screen(<960px)
export const actionEventNames: ActionEventNames = {
	issue_license: {
		large_screen: 'calypso_jetpack_agency_dashboard_issue_license_large_screen',
		small_screen: 'calypso_jetpack_agency_dashboard_issue_license_small_screen',
	},
	view_activity: {
		large_screen: 'calypso_jetpack_agency_dashboard_view_activity_large_screen',
		small_screen: 'calypso_jetpack_agency_dashboard_view_activity_small_screen',
	},
	view_site: {
		large_screen: 'calypso_jetpack_agency_dashboard_view_site_large_screen',
		small_screen: 'calypso_jetpack_agency_dashboard_view_site_small_screen',
	},
	visit_wp_admin: {
		large_screen: 'calypso_jetpack_agency_dashboard_visit_wp_admin_large_screen',
		small_screen: 'calypso_jetpack_agency_dashboard_visit_wp_admin_small_screen',
	},
	clone_site: {
		large_screen: 'calypso_jetpack_agency_dashboard_clone_site_large_screen',
		small_screen: 'calypso_jetpack_agency_dashboard_clone_site_small_screen',
	},
	site_settings: {
		large_screen: 'calypso_jetpack_agency_dashboard_site_settings_large_screen',
		small_screen: 'calypso_jetpack_agency_dashboard_site_settings_small_screen',
	},
};

// Returns event name based on the action type
export const getActionEventName = ( actionType: AllowedActionTypes, isLargeScreen: boolean ) => {
	const deviceKey = isLargeScreen ? 'large_screen' : 'small_screen';
	return actionEventNames?.[ actionType ]?.[ deviceKey ];
};

// Backup feature status event names for large screen(>960px) and small screen(<960px)
const backupEventNames: StatusEventNames = {
	inactive: {
		small_screen: 'calypso_jetpack_agency_dashboard_add_backup_click_small_screen',
		large_screen: 'calypso_jetpack_agency_dashboard_add_backup_click_large_screen',
	},
	progress: {
		small_screen: 'calypso_jetpack_agency_dashboard_backup_progress_click_small_screen',
		large_screen: 'calypso_jetpack_agency_dashboard_backup_progress_click_large_screen',
	},
	critical: {
		small_screen: 'calypso_jetpack_agency_dashboard_backup_failed_click_small_screen',
		large_screen: 'calypso_jetpack_agency_dashboard_backup_failed_click_large_screen',
	},
	warning: {
		small_screen: 'calypso_jetpack_agency_dashboard_backup_warning_click_small_screen',
		large_screen: 'calypso_jetpack_agency_dashboard_backup_warning_click_large_screen',
	},
	success: {
		small_screen: 'calypso_jetpack_agency_dashboard_backup_success_click_small_screen',
		large_screen: 'calypso_jetpack_agency_dashboard_backup_success_click_large_screen',
	},
};

// Scan feature status event names for large screen(>960px) and small screen(<960px)
const scanEventNames: StatusEventNames = {
	inactive: {
		small_screen: 'calypso_jetpack_agency_dashboard_add_scan_click_small_screen',
		large_screen: 'calypso_jetpack_agency_dashboard_add_scan_click_large_screen',
	},
	progress: {
		small_screen: 'calypso_jetpack_agency_dashboard_scan_progress_click_small_screen',
		large_screen: 'calypso_jetpack_agency_dashboard_scan_progress_click_large_screen',
	},
	failed: {
		small_screen: 'calypso_jetpack_agency_dashboard_scan_threats_click_small_screen',
		large_screen: 'calypso_jetpack_agency_dashboard_scan_threats_click_large_screen',
	},
	success: {
		small_screen: 'calypso_jetpack_agency_dashboard_scan_success_click_small_screen',
		large_screen: 'calypso_jetpack_agency_dashboard_scan_success_click_large_screen',
	},
};

// Monitor feature status event names for large screen(>960px) and small screen(<960px)
const monitorEventNames: StatusEventNames = {
	disabled: {
		small_screen: 'calypso_jetpack_agency_dashboard_monitor_inactive_click_small_screen',
		large_screen: 'calypso_jetpack_agency_dashboard_monitor_inactive_click_large_screen',
	},
	failed: {
		small_screen: 'calypso_jetpack_agency_dashboard_monitor_site_down_click_small_screen',
		large_screen: 'calypso_jetpack_agency_dashboard_monitor_site_down_click_large_screen',
	},
	success: {
		small_screen: 'calypso_jetpack_agency_dashboard_monitor_success_click_small_screen',
		large_screen: 'calypso_jetpack_agency_dashboard_monitor_success_click_large_screen',
	},
};

// Plugin updates status event names for large screen(>960px) and small screen(<960px)
const pluginEventNames: StatusEventNames = {
	warning: {
		small_screen: 'calypso_jetpack_agency_dashboard_update_plugins_click_small_screen',
		large_screen: 'calypso_jetpack_agency_dashboard_update_plugins_click_large_screen',
	},
	success: {
		small_screen: 'calypso_jetpack_agency_dashboard_plugin_click_small_screen',
		large_screen: 'calypso_jetpack_agency_dashboard_plugin_click_large_screen',
	},
};

// Returns event name needed for all the feature state clicks on the agency dashboard
const getRowEventName = (
	type: AllowedTypes,
	status: AllowedStatusTypes,
	isLargeScreen: boolean
) => {
	const deviceKey = isLargeScreen ? 'large_screen' : 'small_screen';
	switch ( type ) {
		case 'backup': {
			return backupEventNames?.[ status ]?.[ deviceKey ];
		}
		case 'scan': {
			return scanEventNames?.[ status ]?.[ deviceKey ];
		}
		case 'monitor': {
			return monitorEventNames?.[ status ]?.[ deviceKey ];
		}
		case 'plugin': {
			return pluginEventNames?.[ status ]?.[ deviceKey ];
		}
	}
};

const backupTooltips: StatusTooltip = {
	critical: translate( 'Latest backup failed' ),
	warning: translate( 'Latest backup completed with warnings' ),
	inactive: translate( 'Add Jetpack VaultPress Backup to this site' ),
	progress: translate( 'Backup in progress' ),
	success: translate( 'Latest backup completed successfully' ),
};

const scanTooltips: StatusTooltip = {
	failed: translate( 'Potential threats found' ),
	inactive: translate( 'Add Jetpack Scan to this site' ),
	progress: translate( 'Scan in progress' ),
	success: translate( 'No threats detected' ),
};

const monitorTooltips: StatusTooltip = {
	failed: translate( 'Site appears to be offline' ),
	success: translate( 'No downtime detected' ),
	disabled: translate( 'Monitor is off' ),
};

const pluginTooltips: StatusTooltip = {
	warning: translate( 'Plugin updates are available' ),
	success: translate( 'No plugin updates found' ),
};

const getTooltip = ( type: AllowedTypes, status: AllowedStatusTypes ) => {
	switch ( type ) {
		case 'backup': {
			return backupTooltips?.[ status ];
		}
		case 'scan': {
			return scanTooltips?.[ status ];
		}
		case 'monitor': {
			return monitorTooltips?.[ status ];
		}
		case 'plugin': {
			return pluginTooltips?.[ status ];
		}
	}
};

/**
 * Returns link and tooltip for each feature based on status
 * which will be used to format row values. link will be used
 * to redirect the user when clicked on the row and tooltip is
 * used to show the tooltip when hovered over the row
 */
const getLinks = (
	type: AllowedTypes,
	status: string,
	siteUrl: string,
	siteUrlWithScheme: string
): {
	link: string;
	isExternalLink: boolean;
} => {
	let link = '';
	let isExternalLink = false;

	const siteUrlWithMultiSiteSupport = urlToSlug( siteUrl );

	switch ( type ) {
		case 'backup': {
			if ( status !== 'inactive' ) {
				link = `/backup/${ siteUrlWithMultiSiteSupport }`;
			}
			break;
		}
		case 'scan': {
			if ( status !== 'inactive' ) {
				link = `/scan/${ siteUrlWithMultiSiteSupport }`;
			}
			break;
		}
		case 'monitor': {
			if ( status === 'failed' ) {
				link = `https://jptools.wordpress.com/debug/?url=${ siteUrl }`;
				isExternalLink = true;
			} else {
				link = `${ siteUrlWithScheme }/wp-admin/admin.php?page=jetpack#/settings`;
				isExternalLink = true;
			}
			break;
		}
		case 'plugin': {
			link = `https://wordpress.com/plugins/updates/${ siteUrlWithMultiSiteSupport }`;
			isExternalLink = true;
			// FIXME: Remove this condition when we enable plugin management in production
			if ( config.isEnabled( 'jetpack/plugin-management' ) ) {
				link =
					status === 'warning'
						? `/plugins/updates/${ siteUrlWithMultiSiteSupport }`
						: `/plugins/manage/${ siteUrlWithMultiSiteSupport }`;
				isExternalLink = false;
			}
			break;
		}
	}
	return { link, isExternalLink };
};

/**
 * Returns an object which holds meta data required to format
 * the row
 */
export const getRowMetaData = (
	rows: SiteData,
	type: AllowedTypes,
	isLargeScreen: boolean
): RowMetaData => {
	const row = rows[ type ];
	const siteUrl = rows.site?.value?.url;
	const siteUrlWithScheme = rows.site?.value?.url_with_scheme;
	const siteId = rows.site?.value?.blog_id;
	const { link, isExternalLink } = getLinks( type, row.status, siteUrl, siteUrlWithScheme );
	const tooltip = getTooltip( type, row.status );
	const eventName = getRowEventName( type, row.status, isLargeScreen );
	return {
		row,
		link,
		isExternalLink,
		tooltip,
		tooltipId: `${ siteId }-${ type }`,
		siteDown: rows.monitor.error,
		eventName,
	};
};

const formatStatsData = ( site: Site ) => {
	const statsData: StatsNode = {
		status: 'active',
		type: 'stats',
		value: site.site_stats,
	};
	return statsData;
};

const formatBoostData = ( site: Site ) => {
	const boostData: BoostNode = {
		status: 'active',
		type: 'boost',
		value: site.jetpack_boost_scores,
	};
	return boostData;
};

const formatBackupData = ( site: Site ) => {
	const backup = {
		value: '',
		status: '',
		type: 'backup',
	};
	if ( ! site.has_backup ) {
		backup.status = 'inactive';
		return backup as BackupNode;
	}
	switch ( site.latest_backup_status ) {
		case 'rewind_backup_complete':
		case 'backup_only_complete':
			backup.status = 'success';
			break;
		case 'rewind_backup_error':
		case 'backup_only_error':
			backup.status = 'critical';
			backup.value = translate( 'Failed' );
			break;
		case 'rewind_backup_complete_warning':
		case 'backup_only_complete_warning':
		case 'rewind_backup_error_warning':
		case 'backup_only_error_warning':
			backup.status = 'warning';
			backup.value = translate( 'Warning' );
			break;
		default:
			backup.status = 'progress';
			break;
	}
	return backup as BackupNode;
};

const formatScanData = ( site: Site ) => {
	const scan = {
		value: '',
		status: '',
		type: 'scan',
		threats: 0,
	};
	if ( ! site.has_scan ) {
		scan.status = 'inactive';
	} else if ( site.latest_scan_threats_found.length > 0 ) {
		const scanThreats = site.latest_scan_threats_found.length;
		scan.status = 'failed';
		scan.value = translate(
			'%(threats)d Threat',
			'%(threats)d Threats', // plural version of the string
			{
				count: scanThreats,
				args: {
					threats: scanThreats,
				},
			}
		) as string;
		scan.threats = scanThreats;
	} else {
		scan.status = 'success';
	}
	return scan as ScanNode;
};

const formatMonitorData = ( site: Site ) => {
	const monitor = {
		value: '',
		status: '',
		type: 'monitor',
		error: false,
		settings: site.monitor_settings,
	};
	const { monitor_active: monitorActive, monitor_site_status: monitorStatus } =
		site.monitor_settings;
	if ( ! monitorActive ) {
		monitor.status = 'disabled';
	} else if (
		! monitorStatus &&
		// This check is needed because monitor_site_status is false by default
		// and we don't want to show the site down status when the site is first connected and the monitor is enabled
		INITIAL_UNIX_EPOCH !== site.monitor_last_status_change
	) {
		monitor.status = 'failed';
		monitor.value = translate( 'Site Down' );
		monitor.error = true;
	} else {
		monitor.status = 'success';
	}
	return monitor as MonitorNode;
};

/**
 * Returns formatted sites
 */
export const formatSites = ( sites: Array< Site > = [] ): Array< SiteData > | [] => {
	return sites.map( ( site ) => {
		const pluginUpdates = site.awaiting_plugin_updates;
		return {
			site: {
				value: site,
				error: ! site.is_connection_healthy,
				status: 'active',
				type: 'site',
			},
			stats: formatStatsData( site ),
			boost: formatBoostData( site ),
			backup: formatBackupData( site ),
			scan: formatScanData( site ),
			monitor: formatMonitorData( site ),
			plugin: {
				value: `${ pluginUpdates?.length } ${ translate( 'Available' ) }`,
				status: pluginUpdates?.length > 0 ? 'warning' : 'success',
				type: 'plugin',
				updates: pluginUpdates?.length,
			},
			isFavorite: site.is_favorite,
			isSelected: site.isSelected,
			onSelect: site.onSelect,
		};
	} );
};

/**
 * Returns the product slug that can be purchased from the dashboard.
 */
export const getProductSlugFromProductType = ( type: string ): string | undefined => {
	const slugs: Record< string, string > = {
		backup: 'jetpack-backup-t1',
		boost: 'jetpack-boost',
		scan: 'jetpack-scan',
		monitor: 'jetpack-monitor',
	};

	return slugs[ type ];
};

export const availableNotificationDurations = [
	{
		time: 1,
		label: translate( 'After 1 minute' ),
		isPaid: true,
	},
	{
		time: 5,
		label: translate( 'After 5 minutes' ),
	},
	{
		time: 15,
		label: translate( 'After 15 minutes' ),
	},
	{
		time: 30,
		label: translate( 'After 30 minutes' ),
	},
	{
		time: 45,
		label: translate( 'After 45 minutes' ),
	},
	{
		time: 60,
		label: translate( 'After 1 hour' ),
	},
];

export const mobileAppLink = 'https://jetpack.com/mobile/';

export const getSiteCountText = ( sites: Array< Site > ) => {
	if ( ! sites?.length ) {
		return null;
	}
	if ( sites.length === 1 ) {
		return sites[ 0 ].url;
	}
	return translate( '%(siteCount)d sites', {
		args: { siteCount: sites.length },
		comment: '%(siteCount) is no of sites selected, e.g. "2 sites"',
	} );
};

type BoostRating = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

interface BoostThreshold {
	threshold: number;
	rating: BoostRating;
}

export const BOOST_THRESHOLDS: BoostThreshold[] = [
	{ threshold: 90, rating: 'A' },
	{ threshold: 75, rating: 'B' },
	{ threshold: 50, rating: 'C' },
	{ threshold: 35, rating: 'D' },
	{ threshold: 25, rating: 'E' },
	{ threshold: 0, rating: 'F' },
];

export const getBoostRating = ( boostScore: number ): BoostRating => {
	for ( const { threshold, rating } of BOOST_THRESHOLDS ) {
		if ( boostScore > threshold ) {
			return rating;
		}
	}
	return 'F';
};

const GOOD_BOOST_SCORE_THRESHOLD = 75;
const OKAY_BOOST_SCORE_THRESHOLD = 35;

export const getBoostRatingClass = ( boostScore: number ): string => {
	switch ( true ) {
		case boostScore > GOOD_BOOST_SCORE_THRESHOLD:
			return 'boost-score-good';
		case boostScore > OKAY_BOOST_SCORE_THRESHOLD:
			return 'boost-score-okay';
		default:
			return 'boost-score-bad';
	}
};

export function extractBackupTextValues( str: string ): { [ key: string ]: number } {
	const regex = /(\d+)\s+(\w+)(s)?\b/g;

	let match;
	const result: { [ key: string ]: number } = {};

	while ( ( match = regex.exec( str ) ) !== null ) {
		const key = match[ 2 ].replace( /s$/, '' ); // remove "s" from the end of the key if present since we store plural(pages and posts) as singular(page and post)
		result[ key ] = parseInt( match[ 1 ], 10 );
	}

	return result;
}

export const getExtractedBackupTitle = ( backup: Backup ) => {
	const backupText = backup?.activityDescription[ 0 ]?.children[ 0 ]?.text;

	if ( ! backupText ) {
		return backup?.activityTitle;
	}

	const { post: postCount, page: pageCount } = extractBackupTextValues( backupText );

	let backupTitle;

	if ( postCount ) {
		backupTitle = translate( '%(posts)d post', '%(posts)d posts', {
			args: { posts: postCount },
			comment: '%(posts) is the no of posts"',
			count: postCount,
		} );
	}

	if ( pageCount ) {
		const pageCountText = translate( '%(pages)d page', '%(pages)d pages', {
			args: { pages: pageCount },
			comment: '%(pages) is the no of pages"',
			count: pageCount,
		} );
		backupTitle = backupTitle ? `${ backupTitle }, ${ pageCountText }` : pageCountText;
	}

	return backupTitle;
};

export const DASHBOARD_LICENSE_TYPES: { [ key: string ]: AllowedTypes } = {
	BACKUP: 'backup',
};

export const getMonitorDowntimeText = ( downtime: number | undefined ): string => {
	if ( ! downtime ) {
		return translate( 'Downtime' );
	}

	const duration = moment.duration( downtime, 'minutes' );

	const days = duration.days();
	const hours = duration.hours();
	const minutes = duration.minutes();

	const formattedDays = days > 0 ? `${ days }d ` : '';
	const formattedHours = hours > 0 ? `${ hours }h ` : '';
	const formattedMinutes = minutes > 0 ? `${ minutes }m` : '';

	const time = `${ formattedDays }${ formattedHours }${ formattedMinutes }`;

	return translate( 'Downtime for %(time)s', {
		args: {
			time: time.trim(),
		},
		comment: '%(time) is the downtime, e.g. "2d 5h 30m", "5h 30m", "55m"',
	} ) as string;
};

export const DASHBOARD_PREFERENCE_NAMES = {
	EXPANDABLE_BLOCK_POPOVER_MESSAGE:
		'jetpack-cloud-agency-dashboard-expandable-block-popover-message',
};
