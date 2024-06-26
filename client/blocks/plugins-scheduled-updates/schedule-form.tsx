import { APIError } from '@automattic/data-stores';
import { useBreakpoint } from '@automattic/viewport-react';
import { __experimentalText as Text } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import { handleErrorMessage } from 'calypso/blocks/plugin-scheduled-updates-common/error-utils';
import { useCorePluginsQuery } from 'calypso/data/plugins/use-core-plugins-query';
import {
	useCreateUpdateScheduleMutation,
	useEditUpdateScheduleMutation,
} from 'calypso/data/plugins/use-update-schedules-mutation';
import {
	useUpdateScheduleQuery,
	ScheduleUpdates,
} from 'calypso/data/plugins/use-update-schedules-query';
import { useIsEligibleForFeature } from './hooks/use-is-eligible-for-feature';
import { useSiteSlug } from './hooks/use-site-slug';
import { ScheduleFormFrequency } from './schedule-form-frequency';
import { ScheduleFormPaths } from './schedule-form-paths';
import { ScheduleFormPlugins } from './schedule-form-plugins';
import { validatePaths, validatePlugins, validateTimeSlot } from './schedule-form.helper';
import type { PathsOnChangeEvent, SyncSuccessParams } from './types';

import './schedule-form.scss';

interface Props {
	scheduleForEdit?: ScheduleUpdates;
	onSyncSuccess?: ( params: SyncSuccessParams ) => void;
	onSyncError?: ( error: string ) => void;
}
export const ScheduleForm = ( props: Props ) => {
	const siteSlug = useSiteSlug();
	const translate = useTranslate();
	const isSmallScreen = useBreakpoint( '<660px' );
	const { isEligibleForFeature } = useIsEligibleForFeature();
	const { scheduleForEdit, onSyncSuccess, onSyncError } = props;

	const { data: schedulesData = [] } = useUpdateScheduleQuery( siteSlug, isEligibleForFeature );
	const schedules = schedulesData.filter( ( s ) => s.id !== scheduleForEdit?.id ) ?? [];

	const [ selectedPlugins, setSelectedPlugins ] = useState< string[] >(
		scheduleForEdit?.args || []
	);
	const [ frequency, setFrequency ] = useState< 'daily' | 'weekly' >(
		scheduleForEdit?.schedule || 'daily'
	);
	const [ timestamp, setTimestamp ] = useState< number >(
		scheduleForEdit ? scheduleForEdit?.timestamp * 1000 : Date.now()
	);
	const [ healthCheckPaths, setHealthCheckPaths ] = useState< string[] >(
		scheduleForEdit?.health_check_paths || []
	);

	const [ hasUnsubmittedPath, setHasUnsubmittedPath ] = useState( false );

	const scheduledTimeSlots = schedules.map( ( schedule ) => ( {
		timestamp: schedule.timestamp,
		frequency: schedule.schedule,
	} ) );
	const scheduledPlugins = schedules.map( ( schedule ) => schedule.args );
	const [ validationErrors, setValidationErrors ] = useState< Record< string, string > >( {
		plugins: validatePlugins( selectedPlugins, scheduledPlugins ),
		timestamp: validateTimeSlot( { frequency, timestamp }, scheduledTimeSlots ),
		paths: validatePaths( hasUnsubmittedPath ),
	} );
	const [ fieldTouched, setFieldTouched ] = useState< Record< string, boolean > >( {} );

	const serverSyncCallbacks = {
		onSuccess: () => {
			const date = new Date( timestamp * 1000 );
			onSyncSuccess?.( {
				plugins: selectedPlugins,
				frequency,
				hours: date.getHours(),
				weekday: frequency === 'weekly' ? date.getDay() : undefined,
			} );
		},
		onError: ( e: APIError ) => onSyncError && onSyncError( handleErrorMessage( e ) ),
	};
	const { createUpdateSchedule } = useCreateUpdateScheduleMutation( siteSlug, serverSyncCallbacks );
	const { editUpdateSchedule } = useEditUpdateScheduleMutation( siteSlug, serverSyncCallbacks );
	const {
		data: plugins = [],
		isLoading: isPluginsFetching,
		isFetched: isPluginsFetched,
	} = useCorePluginsQuery( siteSlug, true, true );

	const onFormSubmit = () => {
		const formValid = ! Object.values( validationErrors ).filter( ( e ) => !! e ).length;
		setFieldTouched( {
			plugins: true,
			timestamp: true,
			paths: true,
		} );

		const params = {
			plugins: selectedPlugins,
			schedule: {
				timestamp,
				interval: frequency,
				// Temporary: this field is left here for backward compatibility.
				// Will be removed after https://github.com/Automattic/jetpack/pull/37223 is landed.
				health_check_paths: healthCheckPaths,
			},
			health_check_paths: healthCheckPaths,
		};

		if ( formValid ) {
			scheduleForEdit
				? editUpdateSchedule( scheduleForEdit.id, params )
				: createUpdateSchedule( params );
		}
	};

	// Plugin selection validation
	useEffect(
		() =>
			setValidationErrors( {
				...validationErrors,
				plugins: validatePlugins( selectedPlugins, scheduledPlugins ),
			} ),
		[ selectedPlugins ]
	);

	// Time slot/timestamp validation
	useEffect(
		() =>
			setValidationErrors( {
				...validationErrors,
				timestamp: validateTimeSlot( { frequency, timestamp }, scheduledTimeSlots ),
			} ),
		[ timestamp ]
	);

	// Paths validation
	useEffect(
		() =>
			setValidationErrors( {
				...validationErrors,
				paths: validatePaths( hasUnsubmittedPath ),
			} ),
		[ hasUnsubmittedPath ]
	);

	const onPathChange = ( data: PathsOnChangeEvent ) => {
		setHealthCheckPaths( data.paths );
		setHasUnsubmittedPath( data.hasUnsubmittedPath );
	};

	return (
		<form
			id="schedule"
			className="schedule-form"
			onSubmit={ ( e ) => {
				e.preventDefault();
				onFormSubmit();
			} }
		>
			<Text>{ translate( 'Step 1' ) }</Text>
			<ScheduleFormFrequency
				initTimestamp={ timestamp }
				initFrequency={ frequency }
				error={ validationErrors?.timestamp }
				showError={ fieldTouched?.timestamp }
				onChange={ ( frequency, timestamp ) => {
					setTimestamp( timestamp );
					setFrequency( frequency );
				} }
				onTouch={ ( touched ) => {
					setFieldTouched( { ...fieldTouched, timestamp: touched } );
				} }
			/>

			<Text>{ translate( 'Step 2' ) }</Text>
			<ScheduleFormPlugins
				plugins={ plugins }
				selectedPlugins={ selectedPlugins }
				isPluginsFetching={ isPluginsFetching }
				isPluginsFetched={ isPluginsFetched }
				borderWrapper={ ! isSmallScreen }
				error={ validationErrors?.plugins }
				showError={ fieldTouched?.plugins }
				onChange={ setSelectedPlugins }
				onTouch={ ( touched ) => {
					setFieldTouched( { ...fieldTouched, plugins: touched } );
				} }
			/>

			<Text>{ translate( 'Step 3' ) }</Text>
			<ScheduleFormPaths
				paths={ healthCheckPaths }
				borderWrapper={ false }
				onChange={ onPathChange }
				error={ validationErrors?.paths }
				showError={ fieldTouched?.paths }
				onTouch={ ( touched ) => {
					setFieldTouched( { ...fieldTouched, paths: touched } );
				} }
			/>
		</form>
	);
};
