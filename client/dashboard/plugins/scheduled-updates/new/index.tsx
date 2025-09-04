import './style.scss';

import { sitesQuery, pluginsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { type Action } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState, useMemo } from 'react';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { PluginsScheduleNewFrequency, type Weekday } from './components/frequency-selection';
import { PluginsScheduleNewPlugins, type PluginRow } from './components/plugins-selection';
import { PluginsScheduleNewSites } from './components/sites-selection';
import type { Site, PluginItem } from '@automattic/api-core';

// getUniquePlugins not used anymore; plugin list derives from selected sites

export default function NewSchedule() {
	useQuery( sitesQuery() );
	const { data: sitesPlugins } = useQuery( pluginsQuery() );

	const [ selectedSiteIds, setSelectedSiteIds ] = useState< string[] >( [] );
	const [ selectedPluginSlugs, setSelectedPluginSlugs ] = useState< string[] >( [] );

	// Strongly-typed bulk actions to enable selection UI, no actions column displayed via CSS
	const siteBulkActions: Array< Action< Site > > = useMemo(
		() => [
			{
				id: 'bulk-select-sites',
				label: __( 'Select' ),
				supportsBulk: true,
				callback: () => {},
			},
		],
		[]
	);

	const [ frequency, setFrequency ] = useState< 'daily' | 'weekly' >( 'daily' );
	const [ weekday, setWeekday ] = useState< Weekday >( 'Monday' );
	const [ time, setTime ] = useState( '04:00' );

	const isTimeValid = /^([01]\d|2[0-3]):[0-5]\d$/.test( time );
	const isValid =
		selectedSiteIds.length > 0 &&
		selectedPluginSlugs.length > 0 &&
		isTimeValid &&
		( frequency === 'daily' || ( frequency === 'weekly' && !! weekday ) );

	// Strongly-typed bulk actions for plugin rows
	const pluginBulkActions: Array< Action< PluginRow > > = useMemo(
		() => [
			{
				id: 'bulk-select-plugins',
				label: __( 'Select' ),
				supportsBulk: true,
				callback: () => {},
			},
		],
		[]
	);

	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'New schedule' ) } /> }>
			<PluginsScheduleNewSites
				selection={ selectedSiteIds }
				onChangeSelection={ ( ids ) => setSelectedSiteIds( ids ) }
				actions={ siteBulkActions }
			/>

			<PluginsScheduleNewPlugins
				sitesPlugins={ sitesPlugins as { sites?: Record< string, PluginItem[] > } }
				selectedSiteIds={ selectedSiteIds }
				selection={ selectedPluginSlugs }
				onChangeSelection={ ( ids ) => setSelectedPluginSlugs( ids ) }
				actions={ pluginBulkActions }
			/>

			<PluginsScheduleNewFrequency
				frequency={ frequency }
				weekday={ weekday }
				time={ time }
				onChange={ ( next ) => {
					setFrequency( next.frequency );
					setWeekday( next.weekday );
					setTime( next.time );
				} }
			/>

			<div style={ { marginTop: 16 } }>
				<Button variant="primary" disabled={ ! isValid } __next40pxDefaultSize>
					{ __( 'Create schedule' ) }
				</Button>
			</div>
		</PageLayout>
	);
}
