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
import {
	NEW_SCHEDULE_DEFAULT_FREQUENCY,
	NEW_SCHEDULE_DEFAULT_TIME,
	NEW_SCHEDULE_DEFAULT_WEEKDAY,
} from '../constants';
import { formatScheduleCollisionsErrorMulti } from '../helpers';
import { useCreateSchedules } from '../hooks/use-create-schedules';
import { useEligibleSites } from '../hooks/use-eligible-sites';
import { useScheduleCollisions } from '../hooks/use-schedule-collisions';
import FrequencySelection from './frequency-selection';
import PluginsSelection from './plugins-selection';
import SitesSelection from './sites-selection';
import type { Frequency, Weekday } from '../types';

const BLOCK_CREATE = false;

function ScheduledUpdatesNew() {
	const [ selectedSiteIds, setSelectedSiteIds ] = useState< string[] >( [] );
	const [ selectedPluginSlugs, setSelectedPluginSlugs ] = useState< string[] >( [] );
	const [ frequency, setFrequency ] = useState< Frequency >( NEW_SCHEDULE_DEFAULT_FREQUENCY );
	const [ weekday, setWeekday ] = useState< Weekday >( NEW_SCHEDULE_DEFAULT_WEEKDAY );
	const [ time, setTime ] = useState( NEW_SCHEDULE_DEFAULT_TIME );
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

	const handleCreate = useCallback( async () => {
		setValidationError( '' );
		setIsSubmitting( true );

		try {
			const collisions = collisionsChecker.validateNow( {
				siteIds: siteIdsAsNumbers,
				plugins: selectedPluginSlugs,
				frequency,
				weekday,
				time,
			} );

			const message = formatScheduleCollisionsErrorMulti( {
				collisions,
				eligibleSites,
				selectedSiteIds: siteIdsAsNumbers,
			} );

			if ( message ) {
				throw new Error( message );
			}

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
		collisionsChecker,
		eligibleSites,
		siteIdsAsNumbers,
		runCreate,
		navigate,
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
