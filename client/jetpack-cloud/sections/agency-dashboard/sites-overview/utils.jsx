import { translate } from 'i18n-calypso';
import SiteStatusContent from './site-status-content';

/**
 * Returns link and tooltip for each feature based on status
 * which will be used to format row values. link will be used
 * to redirect the user when clicked on the row and tooltip is
 * used to show the tooltip when hovered over the row
 *
 * @param  {type} type  Feature type
 * @param  {status} status Feature status
 * @param  {siteUrl} siteUrl Site URL
 * @param  {siteId} siteId Site ID
 * @returns {object} link & tooltip
 */
const getLinks = ( type, status, siteUrl, siteId ) => {
	let link = '';
	let tooltip = '';
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
 *
 * @param  {rows} rows  Holds row objects(sites)
 * @param  {type} type Feature type
 * @returns {{row, link, siteError, tooltip, tooltipId}} Object that holds
 * row(individual row based on type), link(to redirect on click), siteError,
 * tooltip & tooltip id
 */
export const getRowMetaData = ( rows, type ) => {
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

const siteFormatter = ( rows ) => {
	const { row } = getRowMetaData( rows, 'site' );
	const site = row.value;
	const value = site.url;
	return <span className="sites-overview__row-text">{ value }</span>;
};

/**
 * Returns formatted sites
 *
 * @param  {data} data Object that holds sites as items
 * @returns {Array} An empty array if no sites are found or
 * formatted sites based on status and feature type
 */

export const formatSites = ( data ) => {
	const sites = data?.items;
	if ( ! Array.isArray( sites ) ) {
		return [];
	}
	return sites.map( ( site ) => {
		const pluginUpdates = site.awaiting_plugin_updates;
		let scanValue = '';
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
		let error = '';
		if (
			! site.is_connection_healthy ||
			! site.access_xmlrpc ||
			! site.valid_xmlrpc ||
			! site.authenticated_xmlrpc ||
			! site.has_credentials
		) {
			error = translate( 'FIX CONNECTION' );
		}
		return {
			site: {
				value: site,
				formatter: siteFormatter,
				error,
			},
			backup: {
				value: 'failed' === site.latest_backup_status ? translate( 'Failed' ) : '',
				status: site.backup_enabled ? site.latest_backup_status : 'inactive',
				formatter: ( rows ) => <SiteStatusContent rows={ rows } type="backup" />,
			},
			scan: {
				value: scanValue,
				status: site.scan_enabled ? site.latest_scan_status : 'inactive',
				formatter: ( rows ) => <SiteStatusContent rows={ rows } type="scan" />,
				threats: site.latest_scan_threats_found.length,
			},
			monitor: {
				value: 'failed' === site.monitor_status ? translate( 'Site Down' ) : '',
				status: site.monitor_status === 'accessible' ? 'success' : site.monitor_status,
				formatter: ( rows ) => <SiteStatusContent rows={ rows } type="monitor" />,
			},
			plugin: {
				value: `${ pluginUpdates.length } ${ translate( 'Available' ) }`,
				status: pluginUpdates.length > 0 ? 'warning' : 'active',
				formatter: ( rows ) => <SiteStatusContent rows={ rows } type="plugin" />,
				updates: pluginUpdates.length,
			},
		};
	} );
};
