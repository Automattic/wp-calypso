import { translate } from 'i18n-calypso';
import type { AllowedTypes, SiteData } from './types';
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
): { tooltip: ReactChild | undefined; link: string } => {
	let link = '';
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
	return { link, tooltip };
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
	siteError: string;
	tooltip: ReactChild | undefined;
	tooltipId: string;
} => {
	const row = rows[ type ];
	const siteUrl = rows.site?.value?.url;
	const siteError = rows.site?.error;
	const siteId = rows.site?.value?.blog_id;
	const { link, tooltip } = getLinks( type, row.status, siteUrl, siteId );
	return {
		row,
		link,
		siteError,
		tooltip,
		tooltipId: `${ siteId }-${ type }`,
	};
};

/**
 * Returns formatted sites
 */
export const formatSites = ( data: { items: Array< any > } ): Array< any > => {
	const sites = data?.items || [];
	return sites.map( ( site ) => {
		const pluginUpdates = site.awaiting_plugin_updates;
		let scanValue;
		if ( site.latest_scan_status === 'failed' ) {
			scanValue = translate( 'Failed' );
		}
		const scanThreats = site.latest_scan_threats_found.length;
		if ( scanThreats > 0 ) {
			scanValue = translate(
				'%(threats)d Threat',
				'%(threats)d Threats', // plural version of the string
				{
					count: scanThreats,
					args: {
						threats: scanThreats,
					},
				}
			);
		}
		let error;
		if (
			! site.is_connection_healthy ||
			! site.access_xmlrpc ||
			! site.valid_xmlrpc ||
			! site.authenticated_xmlrpc
		) {
			error = translate( 'FIX CONNECTION' );
		}
		return {
			site: {
				value: site,
				error,
				status: '',
				type: 'site',
			},
			backup: {
				value: 'failed' === site.latest_backup_status ? translate( 'Failed' ) : '',
				status: site.backup_enabled ? site.latest_backup_status : 'inactive',
				type: 'backup',
			},
			scan: {
				value: scanValue,
				status: site.scan_enabled ? site.latest_scan_status : 'inactive',
				type: 'scan',
				threats: site.latest_scan_threats_found.length,
			},
			monitor: {
				value: 'failed' === site.monitor_status ? translate( 'Site Down' ) : '',
				status: site.monitor_status === 'accessible' ? 'success' : site.monitor_status,
				type: 'monitor',
			},
			plugin: {
				value: `${ pluginUpdates.length } ${ translate( 'Available' ) }`,
				status: pluginUpdates.length > 0 ? 'warning' : 'active',
				type: 'plugin',
				updates: pluginUpdates.length,
			},
		};
	} );
};
