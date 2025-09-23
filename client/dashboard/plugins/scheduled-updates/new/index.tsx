// (batch/createMonitor mutations are internalized in useCreateSchedules)
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
import {
	pluginsScheduledUpdatesNewRoute,
	pluginsScheduledUpdatesRoute,
} from '../../../app/router/plugins';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { SectionHeader } from '../../../components/section-header';
import { useEligibleSites } from '../hooks/use-eligible-sites';
import FrequencySelection from './components/frequency-selection';
import PluginsSelection from './components/plugins-selection';
import SitesSelection from './components/sites-selection';
import { DEFAULT_FREQUENCY, DEFAULT_TIME, DEFAULT_WEEKDAY } from './constants';
import { useCreateSchedules } from './hooks/use-create-schedules';
import { useScheduleCollisions } from './hooks/use-schedule-collisions';
import type { Frequency, Weekday } from '../types';

const BLOCK_CREATE = false;

type PrecheckInputs = {
	siteIds: number[];
	plugins: string[];
	frequency: Frequency;
	weekday: Weekday;
	time: string;
};

type PrecheckResult = { ok: true } | { ok: false; message: string; collidingSiteIds: number[] };

function ScheduledUpdatesNew() {
	const [ selectedSiteIds, setSelectedSiteIds ] = useState< string[] >( [] );
	const [ selectedPluginSlugs, setSelectedPluginSlugs ] = useState< string[] >( [] );
	const [ frequency, setFrequency ] = useState< Frequency >( DEFAULT_FREQUENCY );
	const [ weekday, setWeekday ] = useState< Weekday >( DEFAULT_WEEKDAY );
	const [ time, setTime ] = useState( DEFAULT_TIME );
	const [ validationError, setValidationError ] = useState< string >( '' );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const isValid = selectedSiteIds.length > 0 && selectedPluginSlugs.length > 0 && ! BLOCK_CREATE;
	const navigate = useNavigate( { from: pluginsScheduledUpdatesNewRoute.fullPath } );
	const { data: eligibleSites = [] } = useEligibleSites();
	const siteIdsAsNumbers = useMemo(
		() => selectedSiteIds.map( ( id ) => Number( id ) ),
		[ selectedSiteIds ]
	);

	const collisionsChecker = useScheduleCollisions();
	const isPrecheckLoading = collisionsChecker.isLoading;

	const precheck = useCallback(
		( inputs: PrecheckInputs ): PrecheckResult => {
			const { siteIds, plugins, frequency: freq, weekday: wk, time: hhmm } = inputs;
			const { timeCollisions, pluginCollisions } = collisionsChecker.validateNow( {
				siteIds,
				plugins,
				frequency: freq,
				weekday: wk,
				time: hhmm,
			} );

			const collisionsError = timeCollisions.error || pluginCollisions.error;
			if ( ! collisionsError ) {
				return { ok: true };
			}

			const collidingSiteIds = timeCollisions.error
				? timeCollisions.collidingSiteIds
				: pluginCollisions.collidingSiteIds;

			const siteMap = new Map( eligibleSites.map( ( s ) => [ s.ID, s ] ) );
			const shouldListSites =
				collidingSiteIds.length > 0 && collidingSiteIds.length < siteIds.length;
			const siteList = shouldListSites
				? collidingSiteIds.map( ( id ) => siteMap.get( id )?.slug || String( id ) ).join( ', ' )
				: '';

			let message = collisionsError;
			if ( shouldListSites ) {
				// translators: %s is a comma-separated list of site slugs.
				const sitesLine = __( 'Sites: %s' ).replace( '%s', siteList );
				message = `${ collisionsError }\n${ sitesLine }`;
			}

			return { ok: false, message, collidingSiteIds };
		},
		[ collisionsChecker, eligibleSites ]
	);

	const { mutateAsync: runCreate } = useCreateSchedules( siteIdsAsNumbers );

	const handleCreate = useCallback( async () => {
		setValidationError( '' );

		if ( ! isValid || isPrecheckLoading ) {
			return;
		}

		setIsSubmitting( true );
		const result = precheck( {
			siteIds: siteIdsAsNumbers,
			plugins: selectedPluginSlugs,
			frequency,
			weekday,
			time,
		} );
		if ( ! result.ok ) {
			setValidationError( result.message );
			setIsSubmitting( false );
			return;
		}

		try {
			await runCreate( {
				plugins: selectedPluginSlugs,
				frequency,
				weekday,
				time,
			} );
			setIsSubmitting( false );
			navigate( { to: pluginsScheduledUpdatesRoute.to } );
		} catch ( error ) {
			setIsSubmitting( false );
			setValidationError(
				( error as { message?: string } )?.message || __( 'Failed to create schedule.' )
			);
		}
	}, [
		frequency,
		weekday,
		time,
		selectedPluginSlugs,
		precheck,
		runCreate,
		navigate,
		siteIdsAsNumbers,
		isValid,
		isPrecheckLoading,
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
						{ validationError && (
							<Notice status="error" isDismissible={ false }>
								{ validationError.split( '\n' ).map( ( line, idx ) => (
									<div key={ idx }>{ line }</div>
								) ) }
							</Notice>
						) }
						<HStack justify="start">
							<Button
								variant="primary"
								disabled={ ! isValid || isSubmitting || isPrecheckLoading }
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
