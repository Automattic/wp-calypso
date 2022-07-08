import { translate } from 'i18n-calypso';
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
	BackupNode,
	ScanNode,
	MonitorNode,
} from './types';

export const siteColumns = [
	{
		key: 'site',
		title: translate( 'Site' ),
	},
	{
		key: 'backup',
		title: translate( 'Backup' ),
	},
	{
		key: 'scan',
		title: translate( 'Scan' ),
	},
	{
		key: 'monitor',
		title: translate( 'Monitor' ),
	},
	{
		key: 'plugin',
		title: translate( 'Plugin Updates' ),
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
	failed: {
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

// Montitor feature status event names for large screen(>960px) and small screen(<960px)
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
	status: AllowedStatusTypes | string,
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
	failed: translate( 'Latest backup failed' ),
	warning: translate( 'Latest backup completed with warnings' ),
	inactive: translate( 'Add Jetpack Backup to this site' ),
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

const getTooltip = ( type: AllowedTypes, status: string ) => {
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
	siteUrlWithScheme: string,
	siteId: number
): {
	link: string;
	isExternalLink: boolean;
} => {
	let link = '';
	let isExternalLink = false;
	switch ( type ) {
		case 'backup': {
			if ( status === 'inactive' ) {
				link = `/partner-portal/issue-license/?site_id=${ siteId }&product_slug=jetpack-backup-realtime&source=dashboard`;
			} else {
				link = `/backup/${ siteUrl }`;
			}
			break;
		}
		case 'scan': {
			if ( status === 'inactive' ) {
				link = `/partner-portal/issue-license/?site_id=${ siteId }&product_slug=jetpack-scan&source=dashboard`;
			} else {
				link = `/scan/${ siteUrl }`;
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
			link = `https://wordpress.com/plugins/updates/${ siteUrl }`;
			isExternalLink = true;
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
	const siteError = rows.site.error;
	const siteId = rows.site?.value?.blog_id;
	const { link, isExternalLink } = getLinks( type, row.status, siteUrl, siteUrlWithScheme, siteId );
	const tooltip = getTooltip( type, row.status );
	const eventName = getRowEventName( type, row.status, isLargeScreen );
	return {
		row,
		link,
		isExternalLink,
		siteError,
		tooltip,
		tooltipId: `${ siteId }-${ type }`,
		siteDown: rows.monitor.error,
		eventName,
	};
};

const formatBackupData = ( site: Site ) => {
	const backup: BackupNode = {
		value: '',
		status: '',
		type: 'backup',
	};
	if ( ! site.has_backup ) {
		backup.status = 'inactive';
		return backup;
	}
	switch ( site.latest_backup_status ) {
		case 'rewind_backup_complete':
		case 'backup_only_complete':
			backup.status = 'success';
			break;
		case 'rewind_backup_error':
		case 'backup_only_error':
			backup.status = 'failed';
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
	return backup;
};

const formatScanData = ( site: Site ) => {
	const scan: ScanNode = {
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
		);
		scan.threats = scanThreats;
	} else {
		scan.status = 'success';
	}
	return scan;
};

const formatMonitorData = ( site: Site ) => {
	const monitor: MonitorNode = {
		value: '',
		status: '',
		type: 'monitor',
		error: false,
	};
	if ( ! site.monitor_active ) {
		monitor.status = 'disabled';
	} else if ( ! site.monitor_site_status ) {
		monitor.status = 'failed';
		monitor.value = translate( 'Site Down' );
		monitor.error = true;
	} else {
		monitor.status = 'success';
	}
	return monitor;
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
				status: '',
				type: 'site',
			},
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
		};
	} );
};
