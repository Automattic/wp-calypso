import { useTranslate } from 'i18n-calypso';
import {
	UpdateMonitorSettings,
	useCreateMonitorSettingsMutation,
} from 'calypso/data/plugins/use-monitor-settings-mutation';
import { useSelector, useDispatch } from 'calypso/state';
import { JETPACK_MODULE_ACTIVATE_SUCCESS } from 'calypso/state/action-types';
import { activateModule } from 'calypso/state/jetpack/modules/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import getSiteUrl from 'calypso/state/selectors/get-site-url';
import { getSiteId } from 'calypso/state/sites/selectors';
import { SiteSlug } from 'calypso/types';
import { CRON_CHECK_INTERVAL } from '../schedule-form.const';

export function useCreateMonitor( siteSlug: SiteSlug ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const siteId = useSelector( ( state ) => getSiteId( state, siteSlug ) );
	const siteUrl = useSelector( ( state ) =>
		getSiteUrl( state, getSiteId( state, siteSlug ) as number )
	);
	const { createMonitorSettings } = useCreateMonitorSettingsMutation( siteSlug, {
		onError: () => {
			dispatch(
				errorNotice(
					translate(
						'We were unable to correctly register the schedule at this time. Please try and re-create a new schedule.'
					)
				)
			);
		},
	} );

	const createMonitor = () => {
		activateModule(
			siteId,
			'monitor',
			true
		)( ( args: { type: string } ) => {
			if ( args.type === JETPACK_MODULE_ACTIVATE_SUCCESS ) {
				createMonitorSettings( {
					urls: [
						{
							// The home URL needs to be one of the URLs monitored.
							check_interval: CRON_CHECK_INTERVAL,
							monitor_url: siteUrl,
						},
						{
							// Monitoring the wp-cron.php file to ensure that the cron jobs are running.
							check_interval: CRON_CHECK_INTERVAL,
							monitor_url: siteUrl + '/wp-cron.php',
						},
					],
				} as UpdateMonitorSettings );
			}
		} );
	};

	return {
		createMonitor,
	};
}
