import {
	TextControl,
	RadioControl,
	SearchControl,
	SelectControl,
	CheckboxControl,
	__experimentalText as Text,
	Flex,
	FlexItem,
	FlexBlock,
} from '@wordpress/components';
import { Icon, info } from '@wordpress/icons';
import classnames from 'classnames';
import { Fragment, useState, useCallback, useEffect } from 'react';
import { useSitePluginsQuery, type SitePlugin } from 'calypso/data/plugins/use-site-plugins-query';
import { SiteSlug } from 'calypso/types';
import {
	DAILY_OPTION,
	DAY_OPTIONS,
	HOUR_OPTIONS,
	PERIOD_OPTIONS,
	WEEKLY_OPTION,
	MAX_SELECTABLE_PLUGINS,
} from './schedule-form.helper';

import './schedule-form.scss';

interface Props {
	siteSlug: SiteSlug;
}
export const ScheduleForm = ( props: Props ) => {
	const { siteSlug } = props;
	const { data } = useSitePluginsQuery( siteSlug );
	const { plugins = [] } = data ?? {};

	const [ name, setName ] = useState( '' );
	const [ frequency, setFrequency ] = useState( 'daily' );
	const [ selectedPlugins, setSelectedPlugins ] = useState< string[] >( [] );
	const [ hour, setHour ] = useState< number >( 6 );
	const [ period, setPeriod ] = useState< 'am' | 'pm' >( 'am' );
	const [ pluginSearchTerm, setPluginSearchTerm ] = useState( '' );
	const [ validationErrors, setValidationErrors ] = useState< Record< string, string > >( {} );
	const [ fieldTouched, setFieldTouched ] = useState< Record< string, boolean > >( {} );

	const onPluginSelectionChange = useCallback(
		( plugin: SitePlugin, isChecked: boolean ) => {
			if ( isChecked ) {
				const _plugins: string[] = [ ...selectedPlugins ];
				_plugins.push( plugin.name );
				setSelectedPlugins( _plugins );
			} else {
				setSelectedPlugins( selectedPlugins.filter( ( name ) => name !== plugin.name ) );
			}
		},
		[ selectedPlugins ]
	);

	const onPluginSelectAllChange = useCallback(
		( isChecked: boolean ) => {
			isChecked
				? setSelectedPlugins( plugins.map( ( plugin ) => plugin.name ) ?? [] )
				: setSelectedPlugins( [] );
		},
		[ plugins ]
	);

	const isPluginSelectionDisabled = useCallback(
		( plugin: SitePlugin ) => {
			return (
				selectedPlugins.length >= MAX_SELECTABLE_PLUGINS &&
				! selectedPlugins.includes( plugin.name )
			);
		},
		[ selectedPlugins, MAX_SELECTABLE_PLUGINS ]
	);

	const validateName = useCallback( () => {
		let error;
		if ( ! name ) {
			error = 'Please provide a name to this plugin update schedule.';
		} else if ( name.length > 120 ) {
			error = 'Please provide a shorter name.';
		}
		setValidationErrors( { ...validationErrors, name: error } );
	}, [ name ] );

	useEffect( validateName, [ validateName ] );

	return (
		<form>
			<Flex
				className="schedule-form"
				direction={ [ 'column', 'row' ] }
				expanded={ true }
				align="start"
				gap={ 12 }
			>
				<FlexItem>
					<div className="form-field">
						<label htmlFor="name">Name</label>
						<TextControl
							id="name"
							value={ name }
							onBlur={ () => setFieldTouched( { ...fieldTouched, name: true } ) }
							onChange={ setName }
							__next40pxDefaultSize
							placeholder="Example: Security plugins"
							autoComplete="off"
						/>
						{ fieldTouched?.name && validationErrors?.name && (
							<Text className="validation-msg">
								<Icon className="icon-info" icon={ info } size={ 16 } />
								{ validationErrors.name }
							</Text>
						) }
					</div>
					<div className="form-field">
						<label htmlFor="frequency">Update every</label>
						<div className={ classnames( 'radio-option', { selected: frequency === 'daily' } ) }>
							<RadioControl
								name="frequency"
								onChange={ setFrequency }
								options={ [ DAILY_OPTION ] }
								selected={ frequency }
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
								onChange={ setFrequency }
								options={ [ WEEKLY_OPTION ] }
								selected={ frequency }
							></RadioControl>
							{ frequency === 'weekly' && (
								<Flex gap={ 6 }>
									<FlexItem>
										<div className="form-field">
											<SelectControl
												name="day"
												__next40pxDefaultSize
												onBlur={ function noRefCheck() {} }
												onChange={ function noRefCheck() {} }
												onFocus={ function noRefCheck() {} }
												options={ DAY_OPTIONS }
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
						<Text className="validation-msg">
							<Icon className="icon-info" icon={ info } size={ 16 } />
							Please pick another time for optimal performance, as this slot is already taken.
						</Text>
					</div>
				</FlexItem>
				<FlexItem>
					<div className="form-field">
						<label htmlFor="plugins">Select plugins</label>
						<span className="plugin-select-stats">
							{ selectedPlugins.length }/{ MAX_SELECTABLE_PLUGINS }
						</span>
						<Text className="info-msg">
							Plugins not listed below are managed by WordPress.com and update automatically.
						</Text>
						<Text className="validation-msg">
							<Icon className="icon-info" icon={ info } size={ 16 } />
							Please select a different set of plugins, as this one has already been chosen.
						</Text>
						<div className="checkbox-options">
							<SearchControl
								id="plugins"
								onChange={ setPluginSearchTerm }
								value={ pluginSearchTerm }
							/>
							<div className="checkbox-options-container">
								{ plugins.length <= MAX_SELECTABLE_PLUGINS && (
									<CheckboxControl
										label="Select all"
										indeterminate={
											selectedPlugins.length > 0 && selectedPlugins.length < plugins.length
										}
										checked={ selectedPlugins.length === plugins.length }
										onChange={ onPluginSelectAllChange }
									/>
								) }
								{ plugins.map( ( plugin ) => (
									<Fragment key={ plugin.name }>
										{ plugin.display_name
											.toLowerCase()
											.includes( pluginSearchTerm.toLowerCase() ) && (
											<CheckboxControl
												key={ plugin.name }
												label={ plugin.display_name }
												checked={ selectedPlugins.includes( plugin.name ) }
												disabled={ isPluginSelectionDisabled( plugin ) }
												className={ classnames( {
													disabled: isPluginSelectionDisabled( plugin ),
												} ) }
												onChange={ ( isChecked ) => onPluginSelectionChange( plugin, isChecked ) }
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
