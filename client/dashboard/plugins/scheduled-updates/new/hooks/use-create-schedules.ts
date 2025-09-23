import {
	updateSchedulesBatchCreateMutation,
	siteJetpackMonitorSettingsCreateMutation,
} from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { useCallback } from '@wordpress/element';
import { useAnalytics } from '../../../../app/analytics';
import { useEligibleSites } from '../../hooks/use-eligible-sites';
import { CRON_CHECK_INTERVAL } from '../constants';
import { prepareTimestamp, runWithConcurrency } from '../helpers';
import type { Frequency, Weekday } from '../../types';
import type { Site, CreateSiteUpdateScheduleBody } from '@automattic/api-core';

type CreateInputs = {
	plugins: string[];
	frequency: Frequency;
	weekday: Weekday;
	time: string;
};

type BatchBody = CreateSiteUpdateScheduleBody;

export function useCreateSchedules( siteIds: number[] ) {
	const { recordTracksEvent } = useAnalytics();
	const { data: eligibleSites = [] } = useEligibleSites();
	const createBatch = useMutation( updateSchedulesBatchCreateMutation( siteIds ) );
	const { mutateAsync: createMonitorForSite } = useMutation(
		siteJetpackMonitorSettingsCreateMutation()
	);

	const mutateAsync = useCallback(
		async ( inputs: CreateInputs ) => {
			const { plugins, frequency, weekday, time } = inputs;
			const timestamp = prepareTimestamp( frequency, weekday, time );
			const body: BatchBody = {
				plugins,
				schedule: {
					interval: frequency,
					timestamp,
					health_check_paths: [],
				},
				health_check_paths: [],
			};

			return await new Promise< void >( ( resolve, reject ) => {
				createBatch.mutate( body, {
					onSuccess: async ( results ) => {
						const successfulSiteIds = ( results || [] )
							.filter( ( r ) => ! r.error )
							.map( ( r ) => r.siteId );

						const eventDate = new Date( timestamp * 1000 );
						const hours = eventDate.getHours();
						const weekdayIndex = frequency === 'weekly' ? eventDate.getDay() : undefined;
						const siteMap = new Map( eligibleSites.map( ( s ) => [ s.ID, s ] ) );

						const monitorTasks = successfulSiteIds
							.map( ( id ) => siteMap.get( id ) )
							.filter( ( s ): s is Site => Boolean( s ) )
							.map( ( site ) => {
								recordTracksEvent( 'calypso_scheduled_updates_create_schedule', {
									site_slug: site.slug,
									frequency,
									plugins_number: plugins.length,
									hours,
									weekday: weekdayIndex,
								} );

								return async () => {
									await createMonitorForSite( {
										siteId: site.ID,
										body: {
											urls: [
												{ monitor_url: site.URL, check_interval: CRON_CHECK_INTERVAL },
												{
													monitor_url: site.URL + '/wp-cron.php',
													check_interval: CRON_CHECK_INTERVAL,
												},
											],
										},
									} );
								};
							} );

						await runWithConcurrency( monitorTasks, 4 );
						resolve();
					},
					onError: ( error ) => reject( error ),
				} );
			} );
		},
		[ createBatch, createMonitorForSite, recordTracksEvent, eligibleSites ]
	);

	return { mutateAsync } as const;
}
