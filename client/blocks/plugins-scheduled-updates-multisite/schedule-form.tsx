import { APIError } from '@automattic/data-stores';
import { useQueryClient } from '@tanstack/react-query';
import { __experimentalText as Text, Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect, useRef, useCallback } from 'react';
import { handleErrorMessage } from 'calypso/blocks/plugin-scheduled-updates-common/error-utils';
import { useCreateMonitors } from 'calypso/blocks/plugins-scheduled-updates/hooks/use-create-monitor';
import { useCoreSitesPluginsQuery } from 'calypso/data/plugins/use-core-sites-plugins-query';
import {
	useBatchCreateUpdateScheduleMutation,
	useBatchDeleteUpdateScheduleMutation,
	useBatchEditUpdateScheduleMutation,
} from 'calypso/data/plugins/use-update-schedules-mutation';
import { MultisiteSchedulesUpdates } from 'calypso/data/plugins/use-update-schedules-query';
import { useSiteExcerptsQuery } from 'calypso/data/sites/use-site-excerpts-query';
import { ScheduleFormFrequency } from '../plugins-scheduled-updates/schedule-form-frequency';
import { ScheduleFormPlugins } from '../plugins-scheduled-updates/schedule-form-plugins';
import { validateSites, validatePlugins } from '../plugins-scheduled-updates/schedule-form.helper';
import { useErrors } from './hooks/use-errors';
import { ScheduleFormSites } from './schedule-form-sites';
import type { SiteDetails } from '@automattic/data-stores';
import type { SiteExcerptData } from '@automattic/sites';
import type {
	MultiSitesResults,
	MultiSiteBaseParams,
} from 'calypso/blocks/plugins-scheduled-updates-multisite/types';

type Props = {
	scheduleForEdit?: MultisiteSchedulesUpdates;
	onNavBack?: () => void;
	onRecordSuccessEvent?: ( sites: MultiSitesResults, params: MultiSiteBaseParams ) => void;
};

type InitialData = {
	sites: number[];
	plugins: string[];
	schedule: string;
	timestamp: number;
};

export const ScheduleForm = ( { onNavBack, scheduleForEdit, onRecordSuccessEvent }: Props ) => {
	const queryClient = useQueryClient();
	const initialData: InitialData = scheduleForEdit
		? {
				sites: scheduleForEdit?.sites.map( ( site ) => site.ID ),
				plugins: scheduleForEdit?.args,
				schedule: scheduleForEdit?.schedule,
				timestamp: scheduleForEdit?.timestamp * 1000,
		  }
		: { sites: [], plugins: [], schedule: 'daily', timestamp: Date.now() / 1000 };

	const [ selectedSites, setSelectedSites ] = useState< number[] >( initialData.sites );
	const [ selectedPlugins, setSelectedPlugins ] = useState< string[] >( initialData.plugins );
	const [ validationErrors, setValidationErrors ] = useState< Record< string, string > >( {} );
	const [ fieldTouched, setFieldTouched ] = useState< Record< string, boolean > >( {} );
	const [ frequency, setFrequency ] = useState< 'daily' | 'weekly' >(
		initialData.schedule as 'daily' | 'weekly'
	);
	const [ timestamp, setTimestamp ] = useState< number >( initialData.timestamp );

	const { addError, clearErrors } = useErrors();

	const translate = useTranslate();

	const siteFilter = ( site: SiteExcerptData ): boolean => {
		return ( site as SiteDetails ).capabilities?.update_plugins && ! site.is_wpcom_staging_site;
	};

	const { data: sites } = useSiteExcerptsQuery( [ 'atomic' ], siteFilter, 'all', [
		'capabilities',
	] );
	const {
		data: plugins,
		isInitialLoading: isPluginsFetching,
		isFetched: isPluginsFetched,
	} = useCoreSitesPluginsQuery( selectedSites, true, true );

	const prevPlugins = useRef( plugins );

	const getPlugins = useCallback( () => {
		// There is a case when the selectedSites updated but the plugins are not fetched yet
		// In this case plugins will be undefined, so we need to keep the previous plugins
		if ( selectedSites.length && plugins === undefined ) {
			return prevPlugins.current;
		}
		return plugins;
	}, [ plugins, selectedSites ] );

	// Sites selection validation
	useEffect(
		() =>
			setValidationErrors( {
				...validationErrors,
				sites: validateSites( selectedSites ),
			} ),
		[ selectedSites ]
	);

	// Sites selection validation
	useEffect(
		() =>
			setValidationErrors( {
				...validationErrors,
				plugins: validatePlugins( selectedPlugins ),
			} ),
		[ selectedPlugins ]
	);

	useEffect( () => {
		if ( selectedSites.length && plugins !== undefined ) {
			prevPlugins.current = plugins;
		}
	}, [ selectedSites, plugins ] );

	useEffect( () => {
		clearErrors();
	}, [] );

	const siteIdsToSlugs = useCallback(
		( siteIds: number[] ) => {
			return sites
				? sites.filter( ( site ) => siteIds.includes( site.ID ) ).map( ( site ) => site.slug )
				: [];
		},
		[ sites ]
	);

	const { createMonitors } = useCreateMonitors();

	// check initial data if site was not already there
	const sitesNotInInitialData = selectedSites.filter(
		( siteId ) => ! initialData.sites.includes( siteId )
	);
	const sitesInInitialData = selectedSites.filter( ( siteId ) =>
		initialData.sites.includes( siteId )
	);
	const initialSitesNotInSelectedSites = initialData.sites.filter(
		( siteId ) => ! selectedSites.includes( siteId )
	);

	const siteSlugsToCreate = siteIdsToSlugs( sitesNotInInitialData );
	const siteSlugsToDelete = siteIdsToSlugs( initialSitesNotInSelectedSites );
	const siteSlugsToUpdate = siteIdsToSlugs( sitesInInitialData );

	const { mutateAsync: createUpdateScheduleAsync, isPending: createUpdateSchedulePending } =
		useBatchCreateUpdateScheduleMutation( siteSlugsToCreate, sitesNotInInitialData );

	const { mutateAsync: editUpdateScheduleAsync, isPending: editUpdateSchedulePending } =
		useBatchEditUpdateScheduleMutation( siteSlugsToUpdate );

	const { mutateAsync: deleteUpdateScheduleAsync, isPending: deleteUpdateSchedulePending } =
		useBatchDeleteUpdateScheduleMutation( siteSlugsToDelete );

	const submitForm = async ( event: React.FormEvent ) => {
		event.preventDefault();

		const params = {
			plugins: selectedPlugins,
			schedule: {
				timestamp,
				interval: frequency,
			},
		};

		const successfulSiteSlugs = [];
		const createdSiteSlugs = [];
		const editedSiteSlugs = [];
		const deletedSiteSlugs = [];
		// Create new schedules
		const createResults = await createUpdateScheduleAsync( params );
		successfulSiteSlugs.push(
			...createResults.filter( ( result ) => ! result.error ).map( ( result ) => result.siteSlug )
		);

		createdSiteSlugs.push(
			...createResults.filter( ( result ) => ! result.error ).map( ( result ) => result.siteSlug )
		);

		createResults
			.filter( ( result ) => result.error )
			.forEach( ( result ) =>
				addError( result.siteSlug, 'create', handleErrorMessage( result.error as APIError ) )
			);

		// Update existing schedules
		if ( scheduleForEdit ) {
			const updateResults = await editUpdateScheduleAsync( {
				id: scheduleForEdit.schedule_id,
				params,
			} );
			successfulSiteSlugs.push(
				...updateResults.filter( ( result ) => ! result.error ).map( ( result ) => result.siteSlug )
			);

			editedSiteSlugs.push(
				...updateResults.filter( ( result ) => ! result.error ).map( ( result ) => result.siteSlug )
			);

			updateResults
				.filter( ( result ) => result.error )
				.forEach( ( result ) =>
					addError( result.siteSlug, 'update', handleErrorMessage( result.error as APIError ) )
				);

			// Delete schedules no longer needed
			const deleteResults = await deleteUpdateScheduleAsync( scheduleForEdit.schedule_id );
			deletedSiteSlugs.push(
				...deleteResults.filter( ( result ) => ! result.error ).map( ( result ) => result.siteSlug )
			);
			deleteResults
				.filter( ( result ) => result.error )
				.forEach( ( result ) =>
					addError( result.siteSlug, 'delete', handleErrorMessage( result.error as APIError ) )
				);
		}

		// Create monitors for sites that have been successfully scheduled
		createMonitors( successfulSiteSlugs );

		if ( successfulSiteSlugs.length > 0 ) {
			const date = new Date( timestamp * 1000 );
			onRecordSuccessEvent?.(
				{
					createdSiteSlugs,
					editedSiteSlugs,
					deletedSiteSlugs,
				},
				{
					plugins_number: selectedPlugins.length,
					frequency,
					hours: date.getHours(),
					weekday: frequency === 'weekly' ? date.getDay() : undefined,
				}
			);
		}

		onNavBack && onNavBack();
		// Trigger an extra refetch 5 seconds later
		setTimeout( () => {
			queryClient.invalidateQueries( {
				queryKey: [ 'multisite-schedules-update' ],
			} );
		}, 5000 );
	};

	return (
		<form id="schedule" onSubmit={ submitForm }>
			<div className="schedule-form">
				<Text>{ translate( 'Step 1' ) }</Text>
				<ScheduleFormSites
					sites={ sites }
					onChange={ setSelectedSites }
					selectedSites={ selectedSites }
					onTouch={ ( touched ) => setFieldTouched( { ...fieldTouched, sites: touched } ) }
					error={ validationErrors?.sites }
					showError={ fieldTouched?.sites }
				/>

				<Text>{ translate( 'Step 2' ) }</Text>
				<ScheduleFormPlugins
					plugins={ getPlugins() }
					selectedPlugins={ selectedPlugins }
					isPluginsFetching={ isPluginsFetching }
					isPluginsFetched={ isPluginsFetched }
					onChange={ setSelectedPlugins }
					onTouch={ ( touched ) => setFieldTouched( { ...fieldTouched, plugins: touched } ) }
					error={ validationErrors?.plugins }
					showError={ fieldTouched?.plugins }
					selectedSites={ selectedSites }
				/>

				<Text>{ translate( 'Step 3' ) }</Text>
				<ScheduleFormFrequency
					initFrequency={ frequency }
					initTimestamp={ timestamp }
					onChange={ ( frequency, timestamp ) => {
						setTimestamp( timestamp );
						setFrequency( frequency );
					} }
					onTouch={ ( touched ) => {
						setFieldTouched( { ...fieldTouched, timestamp: touched } );
					} }
				/>
			</div>

			<Button
				form="schedule"
				type="submit"
				variant="primary"
				isBusy={
					createUpdateSchedulePending || editUpdateSchedulePending || deleteUpdateSchedulePending
				}
				disabled={
					! selectedSites.length ||
					! selectedPlugins.length ||
					createUpdateSchedulePending ||
					editUpdateSchedulePending ||
					deleteUpdateSchedulePending
				}
			>
				{ scheduleForEdit ? translate( 'Save' ) : translate( 'Create' ) }
			</Button>
		</form>
	);
};
