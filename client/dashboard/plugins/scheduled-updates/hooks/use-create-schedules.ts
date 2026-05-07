import {
	updateSchedulesBatchCreateMutation,
	siteJetpackMonitorSettingsCreateMutation,
} from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { CRON_CHECK_INTERVAL } from '../constants';
import { prepareTimestamp, runWithConcurrency } from '../helpers';
import { useEligibleSites } from './use-eligible-sites';
import type { Frequency, Weekday } from '../types';
import type {
	Site,
	CreateSiteUpdateScheduleBody,
	JetpackMonitorSettings,
} from '@automattic/api-core';

export type CreateInputs = {
	plugins: string[];
	frequency: Frequency;
	weekday: Weekday;
	time: string;
};

/**
 * Build Jetpack Monitor URLs payload for a site.
 * Matches legacy behavior: monitor the home URL and `/wp-cron.php` with the same interval.
 */
function createMonitorUrls( siteUrl: string ): JetpackMonitorSettings[ 'urls' ] {
	return [
		// The home URL needs to be one of the URLs monitored.
		{ monitor_url: siteUrl, check_interval: CRON_CHECK_INTERVAL },
		// Monitoring the wp-cron.php file to ensure that the cron jobs are running.
		{ monitor_url: siteUrl + '/wp-cron.php', check_interval: CRON_CHECK_INTERVAL },
	];
}

/**
 * Creates plugin update schedules for the provided sites and wires up monitor checks.
 *
 * Given a set of site IDs, returns a `mutateAsync( inputs )` function that:
 * - Builds the schedule timestamp from `frequency`, `weekday`, and `time`
 * - Calls the batch create schedules endpoint for all sites
 * - Emits analytics events for each successfully scheduled site
 * - Creates Jetpack Monitor checks (site URL and `/wp-cron.php`) for successful sites,
 *   with concurrency limiting
 *
 * Resolves when all side effects complete; rejects if scheduling fails.
 * @param {number[]} siteIds Site IDs to schedule updates for.
 * @returns {{ mutateAsync: ( inputs: CreateInputs ) => Promise< void > }} Hook API
 */
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
			const body: CreateSiteUpdateScheduleBody = {
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
							.filter( ( result ) => ! result.error )
							.map( ( result ) => result.siteId );

						const eventDate = new Date( timestamp * 1000 );
						const hours = eventDate.getHours();
						const weekdayIndex = frequency === 'weekly' ? eventDate.getDay() : undefined;
						const siteMap = new Map( eligibleSites.map( ( site ) => [ site.ID, site ] ) );

						let anyRetryExhausted = false;
						const monitorTasks = successfulSiteIds
							.map( ( id ) => siteMap.get( id ) )
							.filter( ( site ): site is Site => Boolean( site ) )
							.map( ( site ) => {
								recordTracksEvent( 'calypso_scheduled_updates_create_schedule', {
									site_slug: site.slug,
									frequency,
									plugins_number: plugins.length,
									hours,
									weekday: weekdayIndex,
								} );

								return async () => {
									try {
										await createMonitorForSite( {
											siteId: site.ID,
											body: { urls: createMonitorUrls( site.URL ) },
										} );
									} catch ( error ) {
										if ( error instanceof Error && error.message === 'Monitor is not active.' ) {
											anyRetryExhausted = true;
											recordTracksEvent(
												'calypso_scheduled_updates_retry_monitor_settings_failed',
												{ site_slug: site.slug }
											);
										}
										// Swallow other errors; scheduling succeeded and monitor creation is best-effort
									}
								};
							} );

						await runWithConcurrency( monitorTasks, 4 );
						// If any site had monitor retry exhaustion, emit batch-level failure once
						if ( anyRetryExhausted ) {
							recordTracksEvent( 'calypso_scheduled_updates_batch_retry_monitor_settings_failed' );
						}
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
