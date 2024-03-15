import {
	RadioControl,
	SelectControl,
	__experimentalText as Text,
	Flex,
	FlexItem,
	FlexBlock,
} from '@wordpress/components';
import { Icon, info } from '@wordpress/icons';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import { ScheduleFormPlugins } from 'calypso/blocks/plugins-update-manager/schedule-form.plugins';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
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
import {
	DAILY_OPTION,
	DAY_OPTIONS,
	DEFAULT_HOUR,
	HOUR_OPTIONS,
	PERIOD_OPTIONS,
	WEEKLY_OPTION,
} from './schedule-form.const';
import { prepareTimestamp, validatePlugins, validateTimeSlot } from './schedule-form.helper';

import './schedule-form.scss';

interface Props {
	scheduleForEdit?: ScheduleUpdates;
	onSyncSuccess?: () => void;
	onSyncError?: ( error: string ) => void;
}
export const ScheduleForm = ( props: Props ) => {
	const siteSlug = useSiteSlug();
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const { isEligibleForFeature } = useIsEligibleForFeature();
	const { scheduleForEdit, onSyncSuccess, onSyncError } = props;
	const initDate = scheduleForEdit
		? moment( scheduleForEdit?.timestamp * 1000 )
		: moment( new Date() ).hour( DEFAULT_HOUR );
	const { data: plugins = [], isFetched: isPluginsFetched } = useCorePluginsQuery(
		siteSlug,
		true,
		true
	);
	useSetSiteHasEligiblePlugins( plugins, isPluginsFetched );

	const { data: schedulesData = [] } = useUpdateScheduleQuery( siteSlug, isEligibleForFeature );
	const schedules = schedulesData.filter( ( s ) => s.id !== scheduleForEdit?.id ) ?? [];
	const { createUpdateSchedule } = useCreateUpdateScheduleMutation( siteSlug, {
		onSuccess: () => onSyncSuccess && onSyncSuccess(),
		onError: ( e: Error ) => onSyncError && onSyncError( e.message ),
	} );
	const { editUpdateSchedule } = useEditUpdateScheduleMutation( siteSlug, {
		onSuccess: () => onSyncSuccess && onSyncSuccess(),
		onError: ( e: Error ) => onSyncError && onSyncError( e.message ),
	} );

	const [ selectedPlugins, setSelectedPlugins ] = useState< string[] >(
		scheduleForEdit?.args || []
	);
	const [ frequency, setFrequency ] = useState< 'daily' | 'weekly' >(
		scheduleForEdit?.schedule || 'daily'
	);
	const [ day, setDay ] = useState< string >( initDate.weekday().toString() );
	const [ hour, setHour ] = useState< string >( ( initDate.hour() % 12 ).toString() );
	const [ period, setPeriod ] = useState< string >( initDate.hours() < 12 ? 'am' : 'pm' );
	const timestamp = prepareTimestamp( frequency, day, hour, period );
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
					<div className="form-field">
						<label htmlFor="frequency">{ translate( 'Update every' ) }</label>
						<div className={ classnames( 'radio-option', { selected: frequency === 'daily' } ) }>
							<RadioControl
								name="frequency"
								options={ [ DAILY_OPTION ] }
								selected={ frequency }
								onChange={ ( f ) => setFrequency( f as 'daily' ) }
								onBlur={ () => setFieldTouched( { ...fieldTouched, timestamp: true } ) }
							></RadioControl>
							{ frequency === 'daily' && (
								<Flex gap={ 6 }>
									<FlexBlock>
										<div className="form-field">
											<div className="time-controls">
												<SelectControl
													__next40pxDefaultSize
													name="hour"
													value={ hour }
													options={ HOUR_OPTIONS }
													onChange={ setHour }
												/>
												<SelectControl
													__next40pxDefaultSize
													name="period"
													value={ period }
													options={ PERIOD_OPTIONS }
													onChange={ setPeriod }
												/>
											</div>
										</div>
									</FlexBlock>
								</Flex>
							) }
						</div>
						<div className={ classnames( 'radio-option', { selected: frequency === 'weekly' } ) }>
							<RadioControl
								name="frequency"
								options={ [ WEEKLY_OPTION ] }
								selected={ frequency }
								onChange={ ( f ) => setFrequency( f as 'weekly' ) }
								onBlur={ () => setFieldTouched( { ...fieldTouched, timestamp: true } ) }
							></RadioControl>
							{ frequency === 'weekly' && (
								<Flex gap={ 6 } direction={ [ 'column', 'row' ] }>
									<FlexItem>
										<div className="form-field">
											<SelectControl
												__next40pxDefaultSize
												name="day"
												value={ day }
												options={ DAY_OPTIONS }
												onChange={ setDay }
											/>
										</div>
									</FlexItem>
									<FlexBlock>
										<div className="form-field">
											<div className="time-controls">
												<SelectControl
													__next40pxDefaultSize
													name="hour"
													value={ hour }
													options={ HOUR_OPTIONS }
													onChange={ setHour }
												/>
												<SelectControl
													__next40pxDefaultSize
													name="period"
													value={ period }
													options={ PERIOD_OPTIONS }
													onChange={ setPeriod }
												/>
											</div>
										</div>
									</FlexBlock>
								</Flex>
							) }
						</div>
						{ fieldTouched?.timestamp && validationErrors?.timestamp && (
							<Text className="validation-msg">
								<Icon className="icon-info" icon={ info } size={ 16 } />
								{ validationErrors?.timestamp }
							</Text>
						) }
					</div>
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
