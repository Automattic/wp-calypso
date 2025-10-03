import { useCallback } from 'react';
import {
	useBatchCreateMonitorSettingsMutation,
	useCreateMonitorSettingsMutation,
} from 'calypso/data/plugins/use-monitor-settings-mutation';
import { useSelector, useStore } from 'calypso/state';
import { JETPACK_MODULE_ACTIVATE_SUCCESS } from 'calypso/state/action-types';
import { activateModule } from 'calypso/state/jetpack/modules/actions';
import getSiteUrl from 'calypso/state/selectors/get-site-url';
import { getSiteId } from 'calypso/state/sites/selectors';
import { SiteSlug } from 'calypso/types';
import { CRON_CHECK_INTERVAL } from '../schedule-form.const';

function createMonitorUrls( siteUrl: string ) {
	return [
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
	];
}

function activateMonitorModule( siteId: number, onSuccess: () => void ) {
	activateModule(
		siteId,
		'monitor',
		true
	)( ( args: { type: string } ) => {
		if ( args.type === JETPACK_MODULE_ACTIVATE_SUCCESS ) {
			setTimeout( () => {
				onSuccess();
			}, 3000 );
		}
	} );
}

export function useCreateMonitor( siteSlug: SiteSlug ) {
	const siteId = useSelector( ( state ) => getSiteId( state, siteSlug ) );
	const siteUrl = useSelector( ( state ) =>
		getSiteUrl( state, getSiteId( state, siteSlug ) as number )
	);
	const { createMonitorSettings } = useCreateMonitorSettingsMutation( siteSlug );

	const createMonitor = () => {
		activateMonitorModule( siteId!, () =>
			createMonitorSettings( {
				urls: createMonitorUrls( siteUrl! ),
			} )
		);
	};

	return {
		createMonitor,
	};
}

export function useCreateMonitors() {
	const store = useStore();
	const { createMonitorSettings } = useBatchCreateMonitorSettingsMutation();

	const createMonitors = useCallback(
		( siteSlugs: SiteSlug[] ) => {
			const state = store.getState();
			const siteIds = siteSlugs.map( ( slug ) => getSiteId( state, slug ) );
			const siteUrls = siteIds.map( ( siteId ) => getSiteUrl( state, siteId as number ) );

			siteIds.forEach( ( siteId, index ) => {
				const siteUrl = siteUrls[ index ];
				activateMonitorModule( siteId!, () => {
					createMonitorSettings( {
						[ siteSlugs[ index ] ]: {
							urls: createMonitorUrls( siteUrl! ),
						},
					} );
				} );
			} );
		},
		[ createMonitorSettings, store ]
	);

	return {
		createMonitors,
	};
}
