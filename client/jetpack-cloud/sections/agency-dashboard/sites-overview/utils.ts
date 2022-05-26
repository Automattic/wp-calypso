import { translate } from 'i18n-calypso';
import type { AllowedTypes, SiteData, FormattedRowObj } from './types';
import type { ReactChild } from 'react';

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
): { tooltip: ReactChild | undefined; link: string; isExternalLink: boolean } => {
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
	type: AllowedTypes
): {
	row: { value: { url: string }; status: string; error: string };
	link: string;
	isExternalLink: boolean;
	siteError: string;
	tooltip: ReactChild | undefined;
	tooltipId: string;
	siteDown: boolean;
} => {
	const row = rows[ type ];
	const siteUrl = rows.site?.value?.url;
	const siteError = rows.site.error;
	const siteId = rows.site?.value?.blog_id;
	const { link, tooltip, isExternalLink } = getLinks( type, row.status, siteUrl, siteId );
	return {
		row,
		link,
		isExternalLink,
		siteError,
		tooltip,
		tooltipId: `${ siteId }-${ type }`,
		siteDown: rows.monitor.error,
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
