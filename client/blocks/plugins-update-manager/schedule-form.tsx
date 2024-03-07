import {
	RadioControl,
	SearchControl,
	SelectControl,
	CheckboxControl,
	__experimentalText as Text,
	Flex,
	FlexItem,
	FlexBlock,
	Spinner,
} from '@wordpress/components';
import { Icon, info } from '@wordpress/icons';
import classnames from 'classnames';
import { Fragment, useState, useCallback, useEffect } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useCorePluginsQuery, type CorePlugin } from 'calypso/data/plugins/use-core-plugins-query';
import {
	useCreateUpdateScheduleMutation,
	useEditUpdateScheduleMutation,
} from 'calypso/data/plugins/use-update-schedules-mutation';
import {
	useUpdateScheduleQuery,
	ScheduleUpdates,
} from 'calypso/data/plugins/use-update-schedules-query';
import { MAX_SELECTABLE_PLUGINS } from './config';
import { useIsEligibleForFeature } from './hooks/use-is-eligible-for-feature';
import { useSiteSlug } from './hooks/use-site-slug';
import {
	CRON_CHECK_INTERVAL,
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
}
export const ScheduleForm = ( props: Props ) => {
	const moment = useLocalizedMoment();
	const siteSlug = useSiteSlug();
	const isEligibleForFeature = useIsEligibleForFeature();
	const { scheduleForEdit, onSyncSuccess } = props;
	const initDate = scheduleForEdit
		? moment( scheduleForEdit?.timestamp * 1000 )
		: moment( new Date() ).hour( DEFAULT_HOUR );
	const {
		data: plugins = [],
		isLoading: isPluginsFetching,
		isFetched: isPluginsFetched,
	} = useCorePluginsQuery( siteSlug, true );
	const { data: schedulesData = [] } = useUpdateScheduleQuery( siteSlug, isEligibleForFeature );
	const schedules = schedulesData.filter( ( s ) => s.id !== scheduleForEdit?.id ) ?? [];
	const { createUpdateSchedule } = useCreateUpdateScheduleMutation( siteSlug, {
		onSuccess: () => onSyncSuccess && onSyncSuccess(),
	} );
	const { editUpdateSchedule } = useEditUpdateScheduleMutation( siteSlug, {
		onSuccess: () => onSyncSuccess && onSyncSuccess(),
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
	const [ pluginSearchTerm, setPluginSearchTerm ] = useState( '' );
	const [ validationErrors, setValidationErrors ] = useState< Record< string, string > >( {
		plugins: validatePlugins( selectedPlugins, scheduledPlugins ),
		timestamp: validateTimeSlot( { frequency, timestamp }, scheduledTimeSlots ),
	} );
	const [ fieldTouched, setFieldTouched ] = useState< Record< string, boolean > >( {} );

	const onPluginSelectionChange = useCallback(
		( plugin: CorePlugin, isChecked: boolean ) => {
			if ( isChecked ) {
				const _plugins: string[] = [ ...selectedPlugins ];
				_plugins.push( plugin.plugin );
				setSelectedPlugins( _plugins );
			} else {
				setSelectedPlugins( selectedPlugins.filter( ( name ) => name !== plugin.plugin ) );
			}
		},
		[ selectedPlugins ]
	);

	const onPluginSelectAllChange = useCallback(
		( isChecked: boolean ) => {
			isChecked
				? setSelectedPlugins( plugins.map( ( plugin ) => plugin.plugin ) ?? [] )
				: setSelectedPlugins( [] );
		},
		[ plugins ]
	);

	const isPluginSelectionDisabled = useCallback(
		( plugin: CorePlugin ) => {
			return (
				selectedPlugins.length >= MAX_SELECTABLE_PLUGINS &&
				! selectedPlugins.includes( plugin.plugin )
			);
		},
		[ selectedPlugins ]
	);

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
						<label htmlFor="frequency">Update every</label>
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
								<Flex gap={ 6 }>
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
					<div className="form-field">
						<label htmlFor="plugins">Select plugins</label>
						<span className="plugin-select-stats">
							{ selectedPlugins.length }/
							{ plugins.length < MAX_SELECTABLE_PLUGINS ? plugins.length : MAX_SELECTABLE_PLUGINS }
						</span>
						{ fieldTouched?.plugins && validationErrors?.plugins ? (
							<Text className="validation-msg">
								<Icon className="icon-info" icon={ info } size={ 16 } />
								{ validationErrors?.plugins }
							</Text>
						) : (
							<Text className="info-msg">
								Plugins not listed below are managed by WordPress.com and update automatically.
							</Text>
						) }
						<div className="checkbox-options">
							<SearchControl
								id="plugins"
								onChange={ setPluginSearchTerm }
								value={ pluginSearchTerm }
							/>
							<div className="checkbox-options-container">
								{ isPluginsFetching && <Spinner /> }
								{ isPluginsFetched && plugins.length <= MAX_SELECTABLE_PLUGINS && (
									<CheckboxControl
										label="Select all"
										indeterminate={
											selectedPlugins.length > 0 && selectedPlugins.length < plugins.length
										}
										checked={ selectedPlugins.length === plugins.length }
										onChange={ onPluginSelectAllChange }
									/>
								) }
								{ isPluginsFetched &&
									plugins.map( ( plugin ) => (
										<Fragment key={ plugin.plugin }>
											{ plugin.name.toLowerCase().includes( pluginSearchTerm.toLowerCase() ) && (
												<CheckboxControl
													key={ plugin.plugin }
													label={ plugin.name }
													checked={ selectedPlugins.includes( plugin.plugin ) }
													disabled={ isPluginSelectionDisabled( plugin ) }
													className={ classnames( {
														disabled: isPluginSelectionDisabled( plugin ),
													} ) }
													onChange={ ( isChecked ) => {
														setFieldTouched( { ...fieldTouched, plugins: true } );
														onPluginSelectionChange( plugin, isChecked );
													} }
												/>
											) }
										</Fragment>
									) ) }
							</div>
						</div>
					</div>
				</FlexItem>
			</Flex>
		</form>
	);
};
