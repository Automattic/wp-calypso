import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo } from 'react';
import {
	AUTOMOMANAGED_PLUGINS,
	ECOMMERCE_BUNDLED_PLUGINS,
	PREINSTALLED_PLUGINS,
	PREINSTALLED_PREMIUM_PLUGINS,
} from 'calypso/my-sites/plugins/constants';
import {
	BackupNode,
	BoostNode,
	ErrorNode,
	MonitorNode,
	PluginNode,
	ScanNode,
	Site,
	SiteData,
	StatsNode,
} from '../../types';

const INITIAL_UNIX_EPOCH = '1970-01-01 00:00:00';

const formatStatsData = ( site: Site ): StatsNode => ( {
	status: 'active',
	type: 'stats',
	value: site.site_stats,
} );

const formatBoostData = ( site: Site ): BoostNode => ( {
	status: site.has_pending_boost_one_time_score ? 'progress' : 'active',
	type: 'boost',
	value: site.jetpack_boost_scores,
} );

const useFormatBackupData = () => {
	const translate = useTranslate();

	return useCallback(
		( site: Site ): BackupNode => {
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
		},
		[ translate ]
	);
};

const useFormatScanData = () => {
	const translate = useTranslate();

	return useCallback(
		( site: Site ) => {
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
		},
		[ translate ]
	);
};

const useFormatMonitorData = () => {
	const translate = useTranslate();

	return useCallback(
		( site: Site ) => {
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
		},
		[ translate ]
	);
};

const useFormatPluginData = () => {
	const translate = useTranslate();

	return useCallback(
		( site: Site ): PluginNode => {
			const pluginUpdates = site.is_atomic
				? site.awaiting_plugin_updates?.filter(
						( plugin ) =>
							! PREINSTALLED_PLUGINS.includes( plugin ) &&
							! AUTOMOMANAGED_PLUGINS.includes( plugin ) &&
							! ECOMMERCE_BUNDLED_PLUGINS.includes( plugin ) &&
							! Object.keys( PREINSTALLED_PREMIUM_PLUGINS ).includes( plugin )
				  )
				: site.awaiting_plugin_updates;

			if ( ! pluginUpdates ) {
				return {
					value: '',
					status: 'disabled',
					type: 'plugin',
					updates: 0,
				};
			}
			return {
				value: `${ pluginUpdates?.length } ${ translate( 'Available' ) }`,
				status: pluginUpdates?.length > 0 ? 'warning' : 'success',
				type: 'plugin',
				updates: pluginUpdates?.length,
			};
		},
		[ translate ]
	);
};

const formatErrorData = ( site: Site ): ErrorNode => ( {
	status: site.is_connection_healthy ? 'success' : 'failed',
	type: 'error',
	value: site.is_connection_healthy ? 'error' : '',
} );

const useFormatSite = () => {
	const formatBackupData = useFormatBackupData();
	const formatMonitorData = useFormatMonitorData();
	const formatPluginData = useFormatPluginData();
	const formatScanData = useFormatScanData();

	return useCallback(
		( site: Site ): SiteData => {
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
				plugin: formatPluginData( site ),
				error: formatErrorData( site ),
				isFavorite: site.is_favorite,
				isSelected: site.isSelected,
				onSelect: site.onSelect,
			};
		},
		[ formatBackupData, formatMonitorData, formatPluginData, formatScanData ]
	);
};

/**
 * Returns formatted sites
 */
const useFormattedSites = ( sites: Site[] ): SiteData[] => {
	const formatSite = useFormatSite();

	return useMemo( () => sites.map( ( site ) => formatSite( site ) ), [ formatSite, sites ] );
};

export default useFormattedSites;
