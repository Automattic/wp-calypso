import { translate } from 'i18n-calypso';
import type {
	AllowedTypes,
	SiteData,
	FormattedRowObj,
	StatusEventNames,
	ActionEventNames,
	AllowedStatusTypes,
	AllowedActionTypes,
} from './types';
import type { ReactChild } from 'react';

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
	failed: {
		small_screen: 'calypso_jetpack_agency_dashboard_monitor_site_down_click_small_screen',
		large_screen: 'calypso_jetpack_agency_dashboard_monitor_site_down_click_large_screen',
	},
};

// Plugin updates status event names for large screen(>960px) and small screen(<960px)
const pluginEventNames: StatusEventNames = {
	warning: {
		small_screen: 'calypso_jetpack_agency_dashboard_update_plugins_click_small_screen',
		large_screen: 'calypso_jetpack_agency_dashboard_update_plugins_click_large_screen',
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
	siteId: number
): {
	tooltip: ReactChild | undefined;
	link: string;
	isExternalLink: boolean;
} => {
	let link = '';
	let isExternalLink = false;
	let tooltip;
	switch ( type ) {
		case 'backup': {
			if ( status === 'inactive' ) {
				link = `/partner-portal/issue-license/?site_id=${ siteId }`;
			} else {
				link = `/backup/${ siteUrl }`;
			}
			if ( status === 'progress' ) {
				tooltip = translate( 'Backup in progress' );
			}
			break;
		}
		case 'scan': {
			if ( status === 'inactive' ) {
				link = `/partner-portal/issue-license/?site_id=${ siteId }`;
			} else {
				link = `/scan/${ siteUrl }`;
			}
			if ( status === 'progress' ) {
				tooltip = translate( 'Scan in progress' );
			}
			break;
		}
		case 'monitor': {
			if ( status === 'failed' ) {
				link = `https://jptools.wordpress.com/debug/?url=${ siteUrl }`;
				isExternalLink = true;
			}
			if ( status === 'success' ) {
				tooltip = translate( 'Monitor is on and your site is online' );
			}
			break;
		}
		case 'plugin': {
			if ( status === 'warning' ) {
				link = `https://wordpress.com/plugins/updates/${ siteUrl }`;
				isExternalLink = true;
			}
			break;
		}
	}
	return { link, isExternalLink, tooltip };
};

/**
 * Returns an object which holds meta data required to format
 * the row
 */
export const getRowMetaData = (
	rows: SiteData,
	type: AllowedTypes,
	isLargeScreen: boolean
): {
	row: { value: { url: string }; status: string; error: string };
	link: string;
	isExternalLink: boolean;
	siteError: string;
	tooltip: ReactChild | undefined;
	tooltipId: string;
	siteDown: boolean;
	eventName: string | undefined;
} => {
	const row = rows[ type ];
	const siteUrl = rows.site?.value?.url;
	const siteError = rows.site.error;
	const siteId = rows.site?.value?.blog_id;
	const { link, tooltip, isExternalLink } = getLinks( type, row.status, siteUrl, siteId );
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

const formatBackupData = ( site: SiteData ) => {
	const backup: FormattedRowObj = {
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
			backup.status = 'warning';
			backup.value = translate( 'Warning' );
			break;
		default:
			backup.status = 'progress';
			break;
	}
	return backup;
};

const formatScanData = ( site: SiteData ) => {
	const scan: FormattedRowObj = {
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

const formatMonitorData = ( site: SiteData ) => {
	const monitor: FormattedRowObj = {
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
	} else {
		monitor.status = 'success';
	}
	return monitor;
};

/**
 * Returns formatted sites
 */
export const formatSites = ( sites: Array< any > = [] ): Array< any > => {
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
				value: `${ pluginUpdates.length } ${ translate( 'Available' ) }`,
				status: pluginUpdates.length > 0 ? 'warning' : 'success',
				type: 'plugin',
				updates: pluginUpdates.length,
			},
		};
	} );
};
