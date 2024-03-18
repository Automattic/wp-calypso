import { Flex, FlexItem } from '@wordpress/components';
import { useState, useEffect } from 'react';
import { ScheduleFormFrequency } from 'calypso/blocks/plugins-update-manager/schedule-form-frequency';
import { ScheduleFormPlugins } from 'calypso/blocks/plugins-update-manager/schedule-form-plugins';
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
import { useSetSiteHasEligiblePlugins } from './hooks/use-site-has-eligible-plugins';
import { useSiteSlug } from './hooks/use-site-slug';
import { validatePlugins, validateTimeSlot } from './schedule-form.helper';

import './schedule-form.scss';

interface Props {
	scheduleForEdit?: ScheduleUpdates;
	onSyncSuccess?: () => void;
	onSyncError?: ( error: string ) => void;
}
export const ScheduleForm = ( props: Props ) => {
	const siteSlug = useSiteSlug();
	const { isEligibleForFeature } = useIsEligibleForFeature();
	const { scheduleForEdit, onSyncSuccess, onSyncError } = props;

	const { data: plugins = [], isFetched: isPluginsFetched } = useCorePluginsQuery(
		siteSlug,
		true,
		true
	);
	useSetSiteHasEligiblePlugins( plugins, isPluginsFetched );

	const serverSyncCallbacks = {
		onSuccess: () => onSyncSuccess && onSyncSuccess(),
		onError: ( e: Error ) => onSyncError && onSyncError( e.message ),
	};

	const { data: schedulesData = [] } = useUpdateScheduleQuery( siteSlug, isEligibleForFeature );
	const schedules = schedulesData.filter( ( s ) => s.id !== scheduleForEdit?.id ) ?? [];
	const { createUpdateSchedule } = useCreateUpdateScheduleMutation( siteSlug, serverSyncCallbacks );
	const { editUpdateSchedule } = useEditUpdateScheduleMutation( siteSlug, serverSyncCallbacks );

	const [ selectedPlugins, setSelectedPlugins ] = useState< string[] >(
		scheduleForEdit?.args || []
	);
	const [ frequency, setFrequency ] = useState< 'daily' | 'weekly' >(
		scheduleForEdit?.schedule || 'daily'
	);
	const [ timestamp, setTimestamp ] = useState< number >(
		scheduleForEdit ? scheduleForEdit?.timestamp * 1000 : Date.now()
	);
	const scheduledTimeSlots = schedules.map( ( schedule ) => ( {
		timestamp: schedule.timestamp,
		frequency: schedule.schedule,
	} ) );
	const scheduledPlugins = schedules.map( ( schedule ) => schedule.args );
	const [ validationErrors, setValidationErrors ] = useState< Record< string, string > >( {
		plugins: validatePlugins( selectedPlugins, scheduledPlugins ),
		timestamp: validateTimeSlot( { frequency, timestamp }, scheduledTimeSlots ),
	} );
	const [ fieldTouched, setFieldTouched ] = useState< Record< string, boolean > >( {} );

	const onFormSubmit = () => {
		const formValid = ! Object.values( validationErrors ).filter( ( e ) => !! e ).length;
		setFieldTouched( {
			plugins: true,
			timestamp: true,
		} );

		const params = {
			plugins: selectedPlugins,
			schedule: {
				timestamp,
				interval: frequency,
			},
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

	return (
		<form
			id="schedule"
			onSubmit={ ( e ) => {
				e.preventDefault();
				onFormSubmit();
			} }
		>
			<Flex
				className="schedule-form"
				direction={ [ 'column', 'row' ] }
				expanded={ true }
				align="start"
				gap={ 12 }
			>
				<FlexItem>
					<ScheduleFormFrequency
						initTimestamp={ timestamp }
						initFrequency={ frequency }
						error={ validationErrors?.timestamp }
						showError={ fieldTouched?.plugins }
						onChange={ ( frequency, timestamp ) => {
							setTimestamp( timestamp );
							setFrequency( frequency );
						} }
						onTouch={ ( touched ) => {
							setFieldTouched( { ...fieldTouched, timestamp: touched } );
						} }
					/>
				</FlexItem>
				<FlexItem>
					<ScheduleFormPlugins
						initPlugins={ selectedPlugins }
						error={ validationErrors?.plugins }
						showError={ fieldTouched?.plugins }
						onChange={ setSelectedPlugins }
						onTouch={ ( touched ) => {
							setFieldTouched( { ...fieldTouched, plugins: touched } );
						} }
					/>
				</FlexItem>
			</Flex>
		</form>
	);
};
