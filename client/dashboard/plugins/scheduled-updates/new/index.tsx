import { updateSchedulesBatchCreateMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	Button,
	Card,
	CardBody,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback, useMemo, useState } from 'react';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { SectionHeader } from '../../../components/section-header';
import FrequencySelection, { type Frequency, type Weekday } from './components/frequency-selection';
import PluginsSelection from './components/plugins-selection';
import SitesSelection from './components/sites-selection';
import { DEFAULT_FREQUENCY, DEFAULT_TIME, DEFAULT_WEEKDAY } from './constants';
import { prepareTimestamp } from './helpers';

const BLOCK_CREATE = true;

function ScheduledUpdatesNew() {
	const [ selectedSiteIds, setSelectedSiteIds ] = useState< string[] >( [] );
	const [ selectedPluginSlugs, setSelectedPluginSlugs ] = useState< string[] >( [] );
	const [ frequency, setFrequency ] = useState< Frequency >( DEFAULT_FREQUENCY );
	const [ weekday, setWeekday ] = useState< Weekday >( DEFAULT_WEEKDAY );
	const [ time, setTime ] = useState( DEFAULT_TIME );
	const isValid = selectedSiteIds.length > 0 && selectedPluginSlugs.length > 0 && ! BLOCK_CREATE;

	const siteIdsAsNumbers = useMemo(
		() => selectedSiteIds.map( ( id ) => Number( id ) ),
		[ selectedSiteIds ]
	);
	const createMutation = useMutation( updateSchedulesBatchCreateMutation( siteIdsAsNumbers ) );

	const handleCreate = useCallback( () => {
		if ( ! isValid ) {
			return;
		}

		const timestamp = prepareTimestamp( frequency, weekday, time );
		const body = {
			plugins: selectedPluginSlugs,
			schedule: {
				timestamp,
				interval: frequency,
			},
		};

		createMutation.mutate( body );
	}, [ isValid, frequency, weekday, time, selectedPluginSlugs, createMutation ] );

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
						<HStack justify="start">
							<Button
								variant="primary"
								disabled={ ! isValid }
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
