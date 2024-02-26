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
import { useState } from 'react';
import { useSitePluginsQuery } from 'calypso/data/plugins/use-site-plugins-query';
import { SiteSlug } from 'calypso/types';
import {
	DAILY_OPTION,
	DAY_OPTIONS,
	HOUR_OPTIONS,
	PERIOD_OPTIONS,
	WEEKLY_OPTION,
} from './schedule-form.helper';

import './schedule-form.scss';

interface Props {
	siteSlug: SiteSlug;
}
export const ScheduleForm = ( props: Props ) => {
	const { siteSlug } = props;
	const MAX_SELECTABLE_PLUGINS = 10;
	const { data } = useSitePluginsQuery( siteSlug );

	const [ name, setName ] = useState( '' );
	const [ frequency, setFrequency ] = useState( 'daily' );
	const [ pluginSearchTerm, setPluginSearchTerm ] = useState( '' );

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
						<span className="plugin-select-stats">10/10</span>
						<Text className="info-msg">
							Plugins not listed below are managed by WordPress.com and update automatically.
						</Text>
						<Text className="validation-msg">
							<Icon className="icon-info" icon={ info } size={ 16 } />
							Please pick another time for optimal performance, as this slot is already taken.
						</Text>
						<div className="checkbox-options">
							<SearchControl id="plugins" onChange={ setPluginSearchTerm } />
							<div className="checkbox-options-container">
								{ data && data.plugins.length <= MAX_SELECTABLE_PLUGINS && (
									<CheckboxControl
										indeterminate
										label="Select all"
										onChange={ function noRefCheck() {} }
									/>
								) }
								{ data?.plugins.map( ( plugin ) => (
									<>
										{ plugin.display_name
											.toLowerCase()
											.includes( pluginSearchTerm.toLowerCase() ) && (
											<CheckboxControl
												key={ plugin.slug }
												label={ plugin.display_name }
												onChange={ function noRefCheck() {} }
											/>
										) }
									</>
								) ) }
							</div>
						</div>
					</div>
				</FlexItem>
			</Flex>
		</form>
	);
};
