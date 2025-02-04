import { translate } from 'i18n-calypso';
import type { CorePlugin } from 'calypso/data/plugins/types';
import type { ScheduleLog } from 'calypso/data/plugins/use-update-schedule-logs-query';
import type { SiteSlug } from 'calypso/types';

export const getLogDetails = ( log: ScheduleLog, plugins: CorePlugin[], siteSlug: SiteSlug ) => {
	const pluginName =
		plugins.find( ( p ) => p.plugin === log.context?.plugin_name )?.name ||
		log.context?.plugin_name;
	const pluginTranslateArgs = {
		args: {
			plugin: pluginName,
			from: log?.context?.old_version,
			to: log.context?.new_version,
		},
	};

	switch ( log.action ) {
		case 'PLUGIN_UPDATES_START':
			return translate( 'Plugins update started' );
		case 'PLUGIN_UPDATES_SUCCESS':
			if ( log.message === 'no_plugins_to_update' ) {
				return translate( 'Plugins update completed — no plugins to update' );
			}
			return translate( 'Plugins update completed' );
		case 'PLUGIN_UPDATES_FAILURE':
			if ( log.message === 'pre_update_health_check_failed' && log.context?.path ) {
				const path = log.context?.path === '/' ? '' : log.context?.path;
				return translate(
					'Plugins update failed — pre-update site health check failed on %(path)s',
					{
						args: {
							path: siteSlug + path,
						},
					}
				);
			}
			return translate( 'Plugins update failed' );

		case 'PLUGIN_UPDATE_SUCCESS':
			return log.message === 'already_up_to_date'
				? translate( '%(plugin)s is already up to date', pluginTranslateArgs )
				: translate( '%(plugin)s update from %(from)s to %(to)s completed', pluginTranslateArgs );
		case 'PLUGIN_UPDATE_FAILURE':
			return translate( '%(plugin)s update from %(from)s to %(to)s failed', pluginTranslateArgs );
		case 'PLUGIN_UPDATE_FAILURE_AND_ROLLBACK':
			return translate( '%(plugin)s rollback completed', pluginTranslateArgs );
		case 'PLUGIN_UPDATE_FAILURE_AND_ROLLBACK_FAIL':
			return translate( '%(plugin)s rollback failed', pluginTranslateArgs );

		case 'PLUGIN_SITE_HEALTH_CHECK_SUCCESS':
			return translate( 'Site health check completed' );
		case 'PLUGIN_SITE_HEALTH_CHECK_FAILURE':
			if ( log.context?.path ) {
				const path = log.context?.path === '/' ? '' : log.context?.path;
				return translate( 'Site health check failed on %(path)s', {
					args: {
						path: siteSlug + path,
					},
				} );
			}
			return translate( 'Site health check failed' );
	}
};

export const getLogIcon = ( log: ScheduleLog ) => {
	switch ( log.action ) {
		case 'PLUGIN_UPDATES_START':
			return 'sync';
		case 'PLUGIN_UPDATES_SUCCESS':
		case 'PLUGIN_UPDATE_SUCCESS':
		case 'PLUGIN_SITE_HEALTH_CHECK_SUCCESS':
		case 'PLUGIN_UPDATE_FAILURE_AND_ROLLBACK':
			return 'checkmark';
		case 'PLUGIN_UPDATES_FAILURE':
		case 'PLUGIN_UPDATE_FAILURE':
		case 'PLUGIN_SITE_HEALTH_CHECK_FAILURE':
		case 'PLUGIN_UPDATE_FAILURE_AND_ROLLBACK_FAIL':
			return 'cross';
	}
};

export const getLogIconStatus = ( log: ScheduleLog ) => {
	switch ( log.action ) {
		case 'PLUGIN_UPDATES_SUCCESS':
		case 'PLUGIN_UPDATE_SUCCESS':
		case 'PLUGIN_UPDATE_FAILURE_AND_ROLLBACK':
		case 'PLUGIN_SITE_HEALTH_CHECK_SUCCESS':
			return 'success';
		case 'PLUGIN_UPDATES_FAILURE':
		case 'PLUGIN_UPDATE_FAILURE':
		case 'PLUGIN_SITE_HEALTH_CHECK_FAILURE':
		case 'PLUGIN_UPDATE_FAILURE_AND_ROLLBACK_FAIL':
			return 'error';
	}
};

export const shouldIndentTimelineEvent = ( log: ScheduleLog ) => {
	switch ( log.action ) {
		case 'PLUGIN_UPDATES_START':
		case 'PLUGIN_UPDATES_SUCCESS':
		case 'PLUGIN_UPDATES_FAILURE':
			return false;
		default:
			return true;
	}
};

export function addSecondsToFormat( format: string ) {
	const hasSeconds = /ss/.test( format );

	if ( hasSeconds ) {
		return format;
	}

	const is24HourFormat = /HH?/.test( format );

	if ( is24HourFormat ) {
		return format + ':ss';
	}

	// If it's 12-hour format, find 'a' or 'A' at the end and insert ':ss' before it
	const amPmIndex = format.lastIndexOf( 'a' );
	if ( amPmIndex !== -1 ) {
		return format.slice( 0, amPmIndex ).trimEnd() + ':ss ' + format.slice( amPmIndex );
	}
	// If 'a' or 'A' is not found, insert 'ss' before the space (if any) at the end
	const trimmedFormat = format.trimEnd();
	const lastSpaceIndex = trimmedFormat.lastIndexOf( ' ' );
	if ( lastSpaceIndex !== -1 ) {
		return trimmedFormat.slice( 0, lastSpaceIndex ) + ':ss' + trimmedFormat.slice( lastSpaceIndex );
	}
	return trimmedFormat + ':ss';
}
