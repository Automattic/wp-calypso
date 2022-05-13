import { Gridicon } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import Badge from 'calypso/components/badge';
import Tooltip from 'calypso/components/tooltip';

const getLinks = ( type, status, siteUrl, siteId ) => {
	let link = '';
	let tooltip = '';
	let eventId = '';
	switch ( type ) {
		case 'backup': {
			if ( status === 'inactive' ) {
				link = `/partner-portal/issue-license/?site_id=${ siteId }`;
				eventId = 'issue-license';
			} else {
				link = `/backup/${ siteUrl }`;
				eventId = 'visit-site';
			}
			if ( status === 'progress' ) {
				tooltip = translate( 'Backup in progress' );
			}
			break;
		}
		case 'scan': {
			if ( status === 'inactive' ) {
				link = `/partner-portal/issue-license/?site_id=${ siteId }`;
				eventId = 'issue-license';
			} else {
				link = `/scan/${ siteUrl }`;
				eventId = 'visit-site';
			}
			if ( status === 'progress' ) {
				tooltip = translate( 'Scan in progress' );
			}
			break;
		}
		case 'monitor': {
			if ( status === 'failed' ) {
				link = `https://jptools.wordpress.com/debug/?url=${ siteUrl }`;
				eventId = 'visit-jp-debugger';
			}
			if ( status === 'success' ) {
				tooltip = translate( 'Monitor is on and your site is online' );
			}
			break;
		}
		case 'plugin': {
			if ( status === 'warning' ) {
				link = `https://wordpress.com/plugins/updates/${ siteUrl }`;
				eventId = 'visit-wp-plugin-updates';
			}
			break;
		}
	}
	return { link, tooltip, eventId };
};

const getRowMetaData = ( rows, type ) => {
	const row = rows[ type ];
	const siteUrl = rows.site?.value?.url;
	const siteError = rows.site?.error;
	const siteId = rows.site?.value?.blog_id;
	const { link, tooltip, eventId } = getLinks( type, row.status, siteUrl, siteId );
	return {
		row,
		link,
		siteError,
		tooltip,
		tooltipId: `${ siteId }-${ type }`,
		eventId,
	};
};

export default function StatusContent( { content, tooltip, tooltipId, link, siteError } ) {
	const statusContentRef = useRef();
	const [ showTooltip, setShowTooltip ] = useState( false );
	const handleShowTooltip = () => {
		setShowTooltip( true );
	};
	const handleHideTooltip = () => {
		setShowTooltip( false );
	};

	const handleClickRowAction = () => {
		// Handle track event here
	};

	let updatedContent = content;

	if ( link ) {
		updatedContent = (
			<a onClick={ handleClickRowAction } href={ link }>
				{ content }
			</a>
		);
	}

	if ( siteError ) {
		updatedContent = <span className="sites-overview__disabled">{ content } </span>;
	}

	return (
		<>
			{ tooltip && ! siteError ? (
				<>
					<span
						ref={ statusContentRef }
						onMouseEnter={ handleShowTooltip }
						onMouseLeave={ handleHideTooltip }
					>
						{ updatedContent }
					</span>
					<Tooltip
						id={ tooltipId }
						context={ statusContentRef.current }
						isVisible={ showTooltip }
						position="bottom"
						className="sites-overview__tooltip"
					>
						{ tooltip }
					</Tooltip>
				</>
			) : (
				updatedContent
			) }
		</>
	);
}

const statusFormatter = ( rows, type ) => {
	const { link, row, siteError, tooltip, tooltipId, eventId } = getRowMetaData( rows, type );
	const { value, status } = row;
	let content;
	switch ( status ) {
		case 'failed': {
			content = (
				<Badge className="sites-overview__badge" type="error">
					{ value }
				</Badge>
			);
			break;
		}
		case 'warning': {
			content = (
				<Badge className="sites-overview__badge" type="warning">
					{ value }
				</Badge>
			);
			break;
		}
		case 'success': {
			content = <Gridicon icon="checkmark" size={ 18 } className="sites-overview__grey-icon" />;
			break;
		}
		case 'active': {
			content = <Gridicon icon="minus-small" size={ 18 } className="sites-overview__icon-active" />;
			break;
		}
		case 'progress': {
			content = (
				<svg
					className="sites-overview__vertical-align-middle"
					width="16"
					height="16"
					viewBox="0 0 16 16"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<circle cx="8" cy="8" r="7.25" stroke="black" strokeWidth="1.5" />
					<rect x="7" y="4" width="1.5" height="5" fill="#1E1E1E" />
					<rect
						x="10.8901"
						y="10.77"
						width="1.5"
						height="4"
						transform="rotate(135 10.8901 10.77)"
						fill="#1E1E1E"
					/>
				</svg>
			);
			break;
		}
		case 'inactive': {
			content = (
				<span className="sites-overview__status-add-new">
					<Gridicon icon="plus-small" size={ 16 } />
					<span>{ translate( 'Add' ) }</span>
				</span>
			);
			break;
		}
	}
	return (
		<StatusContent
			content={ content }
			tooltip={ tooltip }
			tooltipId={ tooltipId }
			link={ link }
			siteError={ siteError }
			type={ type }
			eventId={ eventId }
		/>
	);
};

const siteFormatter = ( rows ) => {
	const { row } = getRowMetaData( rows, 'site' );
	const site = row.value;
	const value = site.url;

	return <span className="sites-overview__row-text">{ value }</span>;
};

export const formatSites = ( data ) => {
	const sites = data?.items;
	if ( Array.isArray( sites ) && sites.length > 0 ) {
		return sites.map( ( site ) => {
			const pluginUpdates = site.awaiting_plugin_updates;
			let scanValue = '';
			if ( site.latest_scan_status === 'failed' ) {
				scanValue = translate( 'Failed' );
				if ( site.latest_scan_threats_found.length > 0 ) {
					scanValue = translate( '%(threats) Threats', {
						args: {
							threats: site.latest_scan_threats_found.length,
						},
					} );
				}
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
					value: site.latest_backup_status === 'failed' ? translate( 'Failed' ) : '',
					status: site.backup_enabled ? site.latest_backup_status : 'inactive',
					formatter: ( rows ) => statusFormatter( rows, 'backup' ),
				},
				scan: {
					value: scanValue,
					status: site.scan_enabled ? site.latest_scan_status : 'inactive',
					formatter: ( rows ) => statusFormatter( rows, 'scan' ),
					threats: site.latest_scan_threats_found.length,
				},
				monitor: {
					value: site.monitor_status === 'failed' ? translate( 'Site Down' ) : '',
					status: site.monitor_status === 'accessible' ? 'success' : site.monitor_status,
					formatter: ( rows ) => statusFormatter( rows, 'monitor' ),
				},
				plugin: {
					value: `${ pluginUpdates.length } ${ translate( 'Available' ) }`,
					status: pluginUpdates.length > 0 ? 'warning' : 'active',
					formatter: ( rows ) => statusFormatter( rows, 'plugin' ),
					updates: pluginUpdates.length,
				},
			};
		} );
	}
	return [];
};
