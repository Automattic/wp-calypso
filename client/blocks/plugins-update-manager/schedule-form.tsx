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
import { Fragment, useState, useCallback } from 'react';
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

	const [ name, setName ] = useState( '' );
	const [ frequency, setFrequency ] = useState( 'daily' );
	const [ selectedPlugins, setSelectedPlugins ] = useState< string[] >( [] );
	const [ pluginSearchTerm, setPluginSearchTerm ] = useState( '' );

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

	const isPluginSelectionDisabled = useCallback(
		( plugin: SitePlugin ) => {
			return (
				selectedPlugins.length >= MAX_SELECTABLE_PLUGINS &&
				! selectedPlugins.includes( plugin.name )
			);
		},
		[ selectedPlugins, MAX_SELECTABLE_PLUGINS ]
	);

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
							onChange={ setName }
							__next40pxDefaultSize
							placeholder="Example: Security plugins"
							autoComplete="off"
						/>
						<Text className="validation-msg">
							<Icon className="icon-info" icon={ info } size={ 16 } />
							Please provide a name to this plugin update schedule.
						</Text>
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
													name="time"
													__next40pxDefaultSize
													onChange={ function noRefCheck() {} }
													options={ HOUR_OPTIONS }
												/>
												<SelectControl
													name="period"
													__next40pxDefaultSize
													onBlur={ function noRefCheck() {} }
													onChange={ function noRefCheck() {} }
													onFocus={ function noRefCheck() {} }
													options={ PERIOD_OPTIONS }
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
													name="time"
													__next40pxDefaultSize
													onBlur={ function noRefCheck() {} }
													onChange={ function noRefCheck() {} }
													onFocus={ function noRefCheck() {} }
													options={ HOUR_OPTIONS }
												/>
												<SelectControl
													name="period"
													__next40pxDefaultSize
													onBlur={ function noRefCheck() {} }
													onChange={ function noRefCheck() {} }
													onFocus={ function noRefCheck() {} }
													options={ PERIOD_OPTIONS }
												/>
											</div>
										</div>
									</FlexBlock>
								</Flex>
							) }
						</div>
						<Text className="validation-msg">
							<Icon className="icon-info" icon={ info } size={ 16 } />
							The current feature implementation only allows to set up two schedules.
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
							Please pick another time for optimal performance, as this slot is already taken.
						</Text>
						<div className="checkbox-options">
							<SearchControl
								id="plugins"
								onChange={ setPluginSearchTerm }
								value={ pluginSearchTerm }
							/>
							<div className="checkbox-options-container">
								{ data && data.plugins.length <= MAX_SELECTABLE_PLUGINS && (
									<CheckboxControl
										indeterminate
										label="Select all"
										onChange={ function noRefCheck() {} }
									/>
								) }
								{ data?.plugins.map( ( plugin ) => (
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
