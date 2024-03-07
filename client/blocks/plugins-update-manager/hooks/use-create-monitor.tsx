import { wpcomRequest } from '@automattic/data-stores/src/wpcom-request-controls';
import { useSelector } from 'calypso/state';
import { JETPACK_MODULE_ACTIVATE_SUCCESS } from 'calypso/state/action-types';
import { activateModule } from 'calypso/state/jetpack/modules/actions';
import getSiteUrl from 'calypso/state/selectors/get-site-url';
import { getSiteId } from 'calypso/state/sites/selectors';
import { CRON_CHECK_INTERVAL } from '../schedule-form.const';

export type UpdateMonitorURLOptions = {
	status_down_webhook_url: string;
};

export type UpdateMonitorURL = {
	monitor_url: string;
	check_interval: number;
	options: UpdateMonitorURLOptions;
};

export type UpdateMonitorSettings = {
	wp_note_notifications?: boolean;
	email_notifications?: boolean;
	sms_notifications?: boolean;
	jetmon_defer_status_down_minutes?: number;
	urls?: UpdateMonitorURL[];
};

export type UpdateMonitorSettingsCreate = {
	success: boolean;
	settings: UpdateMonitorSettings;
};

export function useCreateMonitor( siteSlug: string ) {
	const siteId = useSelector( ( state ) => getSiteId( state, siteSlug ) );
	const siteUrl = useSelector( ( state ) =>
		getSiteUrl( state, getSiteId( state, siteSlug ) as number )
	);

	const createMonitor = () => {
		activateModule(
			siteId,
			'monitor',
			true
		)( ( args: { type: string } ) => {
			// The home URL needs to be one of the URLs monitored.
			// Monitoring the wp-cron.php file to ensure that the cron jobs are running.
			if ( args.type === JETPACK_MODULE_ACTIVATE_SUCCESS ) {
				wpcomRequest( {
					path: `/sites/${ siteSlug }/jetpack-monitor-settings`,
					apiNamespace: 'wpcom/v2',
					method: 'POST',
					body: {
						urls: [
							{
								check_interval: CRON_CHECK_INTERVAL,
								monitor_url: siteUrl,
							},
							{
								check_interval: CRON_CHECK_INTERVAL,
								monitor_url: siteUrl + '/wp-cron.php',
							},
						],
					},
				} );
			}
		} );
	};

	return {
		createMonitor,
	};
}
