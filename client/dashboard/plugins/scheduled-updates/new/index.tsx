import {
	updateSchedulesBatchCreateMutation,
	siteJetpackMonitorSettingsCreateMutation,
	hostingUpdateSchedulesQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
	Button,
	Card,
	CardBody,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Notice,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback, useMemo, useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import {
	pluginsScheduledUpdatesNewRoute,
	pluginsScheduledUpdatesRoute,
} from '../../../app/router/plugins';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { SectionHeader } from '../../../components/section-header';
import { useEligibleSites } from '../hooks/use-eligible-sites';
import FrequencySelection, { type Frequency, type Weekday } from './components/frequency-selection';
import PluginsSelection from './components/plugins-selection';
import SitesSelection from './components/sites-selection';
import { DEFAULT_FREQUENCY, DEFAULT_TIME, DEFAULT_WEEKDAY, CRON_CHECK_INTERVAL } from './constants';
import {
	getTimeSlotsBySiteFromMultisite,
	hasTimeSlotCollision,
	prepareTimestamp,
	runWithConcurrency,
} from './helpers';
import type { Site } from '@automattic/api-core';

const BLOCK_CREATE = false;

function ScheduledUpdatesNew() {
	const [ selectedSiteIds, setSelectedSiteIds ] = useState< string[] >( [] );
	const [ selectedPluginSlugs, setSelectedPluginSlugs ] = useState< string[] >( [] );
	const [ frequency, setFrequency ] = useState< Frequency >( DEFAULT_FREQUENCY );
	const [ weekday, setWeekday ] = useState< Weekday >( DEFAULT_WEEKDAY );
	const [ time, setTime ] = useState( DEFAULT_TIME );
	const [ validationError, setValidationError ] = useState< string >( '' );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const isValid = selectedSiteIds.length > 0 && selectedPluginSlugs.length > 0 && ! BLOCK_CREATE;
	const { recordTracksEvent } = useAnalytics();
	const navigate = useNavigate( { from: pluginsScheduledUpdatesNewRoute.fullPath } );
	const { data: eligibleSites = [] } = useEligibleSites();
	const siteIdsAsNumbers = useMemo(
		() => selectedSiteIds.map( ( id ) => Number( id ) ),
		[ selectedSiteIds ]
	);
	const createBatch = useMutation( updateSchedulesBatchCreateMutation( siteIdsAsNumbers ) );
	const { mutateAsync: createMonitorForSite } = useMutation(
		siteJetpackMonitorSettingsCreateMutation()
	);
	const { data: hostingSchedules } = useQuery( hostingUpdateSchedulesQuery() );

	const handleCreate = useCallback( () => {
		setValidationError( '' );
		if ( ! isValid ) {
			return;
		}

		const timestamp = prepareTimestamp( frequency, weekday, time );

		// Pre-flight multi-site collision check
		const slotsBySite = hostingSchedules ? getTimeSlotsBySiteFromMultisite( hostingSchedules ) : {};
		const collidingSiteIds = siteIdsAsNumbers.filter( ( siteId ) =>
			hasTimeSlotCollision( { frequency, timestamp }, slotsBySite[ siteId ] || [] )
		);
		if ( collidingSiteIds.length > 0 || new Date( timestamp * 1000 ) < new Date() ) {
			// Build error string (legacy parity) + add sites on a new line
			const baseError =
				new Date( timestamp * 1000 ) < new Date()
					? __( 'Please choose a time in the future for this schedule.' )
					: __( 'Please choose another time, as this slot is already scheduled.' );
			const siteMap = new Map( eligibleSites.map( ( s ) => [ s.ID, s ] ) );
			const siteList = collidingSiteIds
				.map( ( id ) => siteMap.get( id )?.slug || String( id ) )
				.join( ', ' );
			setValidationError(
				siteList ? `${ baseError }\n${ __( 'Sites:' ) } ${ siteList }` : baseError
			);
			window.scrollTo( { top: 0, behavior: 'smooth' } );
			return;
		}

		setIsSubmitting( true );
		const body = {
			plugins: selectedPluginSlugs,
			schedule: {
				timestamp,
				interval: frequency,
				health_check_paths: [],
			},
			health_check_paths: [],
		};

		createBatch.mutate( body, {
			onSuccess: async ( results ) => {
				const successfulSiteIds = ( results || [] )
					.filter( ( result ) => ! result.error )
					.map( ( result ) => result.siteId );

				// Precompute values reused per site for Tracks
				const eventDate = new Date( timestamp * 1000 );
				const hours = eventDate.getHours();
				const weekdayIndex = frequency === 'weekly' ? eventDate.getDay() : undefined;
				const siteMap = new Map( eligibleSites.map( ( site ) => [ site.ID, site ] ) );

				// Create monitor settings for each successful site using per-site mutation (with retry)
				const monitorTasks = successfulSiteIds
					.map( ( siteId ) => siteMap.get( siteId ) )
					.filter( ( site ): site is Site => Boolean( site ) )
					.map( ( site ) => {
						recordTracksEvent( 'calypso_scheduled_updates_create_schedule', {
							site_slug: site.slug,
							frequency,
							plugins_number: selectedPluginSlugs.length,
							hours,
							weekday: weekdayIndex,
						} );

						return async () => {
							await createMonitorForSite( {
								siteId: site.ID,
								body: {
									urls: [
										{ monitor_url: site.URL, check_interval: CRON_CHECK_INTERVAL },
										{ monitor_url: site.URL + '/wp-cron.php', check_interval: CRON_CHECK_INTERVAL },
									],
								},
							} );
						};
					} );

				await runWithConcurrency( monitorTasks, 4 );
				setIsSubmitting( false );
				// Navigate back to the schedules list
				navigate( { to: pluginsScheduledUpdatesRoute.to } );
			},
			onError: ( error ) => {
				setIsSubmitting( false );
				setValidationError(
					( error as { message?: string } )?.message || __( 'Failed to create schedule.' )
				);
				window.scrollTo( { top: 0, behavior: 'smooth' } );
			},
		} );
	}, [
		isValid,
		frequency,
		weekday,
		time,
		selectedPluginSlugs,
		createBatch,
		eligibleSites,
		createMonitorForSite,
		navigate,
		recordTracksEvent,
		hostingSchedules,
		siteIdsAsNumbers,
	] );

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'New schedule' ) }
					description={ __(
						'First, choose the sites you want. Next, select the plugins to update. Finally, set how often the updates should run.'
					) }
				/>
			}
		>
			{ validationError && (
				<Notice status="error" isDismissible={ false }>
					{ validationError.split( '\n' ).map( ( line, idx ) => (
						<div key={ idx }>{ line }</div>
					) ) }
				</Notice>
			) }
			<Card>
				<CardBody>
					<VStack spacing={ 6 }>
						<SectionHeader title={ __( '1. Select sites' ) } />
						<SitesSelection
							selection={ selectedSiteIds }
							onChangeSelection={ ( ids ) => setSelectedSiteIds( ids ) }
						/>
						<SectionHeader
							title={ __( '2. Select plugins' ) }
							description={ __(
								'Plugins not listed below are automatically updated by WordPress.com.'
							) }
						/>
						<PluginsSelection
							selectedSiteIds={ selectedSiteIds }
							selection={ selectedPluginSlugs }
							onChangeSelection={ ( ids ) => setSelectedPluginSlugs( ids ) }
						/>
						<SectionHeader title={ __( '3. Select frequency' ) } />
						<FrequencySelection
							frequency={ frequency }
							weekday={ weekday }
							time={ time }
							onChange={ ( next ) => {
								setFrequency( next.frequency );
								setWeekday( next.weekday );
								setTime( next.time );
							} }
						/>
						<HStack justify="start">
							<Button
								variant="primary"
								disabled={ ! isValid || isSubmitting }
								onClick={ handleCreate }
								__next40pxDefaultSize
							>
								{ __( 'Create schedule' ) }
							</Button>
						</HStack>
					</VStack>
				</CardBody>
			</Card>
		</PageLayout>
	);
}

export default ScheduledUpdatesNew;
