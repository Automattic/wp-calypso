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
	plugins: string[];
	frequency: Frequency;
	weekday: Weekday;
	time: string;
};

function ScheduledUpdatesNew() {
	const [ selectedSiteIds, setSelectedSiteIds ] = useState< string[] >( [] );
	const [ selectedPluginSlugs, setSelectedPluginSlugs ] = useState< string[] >( [] );
	const [ frequency, setFrequency ] = useState< Frequency >( DEFAULT_FREQUENCY );
	const [ weekday, setWeekday ] = useState< Weekday >( DEFAULT_WEEKDAY );
	const [ time, setTime ] = useState( DEFAULT_TIME );
	const [ validationError, setValidationError ] = useState< string >( '' );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const navigate = useNavigate( { from: pluginsScheduledUpdatesNewRoute.fullPath } );
	const { data: eligibleSites = [] } = useEligibleSites();
	const siteIdsAsNumbers = useMemo(
		() => selectedSiteIds.map( ( id ) => Number( id ) ),
		[ selectedSiteIds ]
	);
	const collisionsChecker = useScheduleCollisions();
	const { mutateAsync: runCreate } = useCreateSchedules( siteIdsAsNumbers );

	const isValid = selectedSiteIds.length > 0 && selectedPluginSlugs.length > 0 && ! BLOCK_CREATE;
	const isPrecheckLoading = collisionsChecker.isLoading;

	/**
	 * Pre-checks the inputs to ensure they are valid (time slot and plugin set collisions).
	 * If there are collisions, throws the Collisions error (+ list of colliding sites, if applicable).
	 */
	const precheck = useCallback(
		( { plugins, frequency, weekday, time }: PrecheckInputs ): void => {
			const { timeCollisions, pluginCollisions } = collisionsChecker.validateNow( {
				siteIds: siteIdsAsNumbers,
				plugins,
				frequency,
				weekday,
				time,
			} );
			const collisionsError = timeCollisions.error || pluginCollisions.error;

			if ( ! collisionsError ) {
				return;
			}

			const collidingSiteIds = timeCollisions.error
				? timeCollisions.collidingSiteIds
				: pluginCollisions.collidingSiteIds;

			const siteMap = new Map( eligibleSites.map( ( site ) => [ site.ID, site ] ) );
			// If there are more than one colliding site and less than all selected sites,
			// add the list of sites to the error message.
			const shouldListSites =
				collidingSiteIds.length > 0 && collidingSiteIds.length < siteIdsAsNumbers.length;
			const siteList = shouldListSites
				? collidingSiteIds.map( ( id ) => siteMap.get( id )?.slug || String( id ) ).join( ', ' )
				: '';

			let message = collisionsError;
			if ( shouldListSites ) {
				// translators: %s is a comma-separated list of site slugs.
				const sitesLine = __( 'Sites: %s' ).replace( '%s', siteList );
				message = `${ collisionsError }\n${ sitesLine }`;
			}

			throw new Error( message );
		},
		[ collisionsChecker, eligibleSites, siteIdsAsNumbers ]
	);

	const handleCreate = useCallback( async () => {
		setValidationError( '' );
		setIsSubmitting( true );

		try {
			precheck( {
				plugins: selectedPluginSlugs,
				frequency,
				weekday,
				time,
			} );

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
	}, [ frequency, weekday, time, selectedPluginSlugs, precheck, runCreate, navigate ] );

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
