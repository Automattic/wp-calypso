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
								options={ [
									{
										label: 'Daily',
										value: 'daily',
									},
								] }
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
													options={ [
														{
															label: '00',
															value: '0',
														},
														{
															label: '01',
															value: '1',
														},
														{
															label: '02',
															value: '3',
														},
														{
															label: '03',
															value: '3',
														},
														{
															label: '04',
															value: '4',
														},
														{
															label: '05',
															value: '5',
														},
														{
															label: '06',
															value: '6',
														},
														{
															label: '07',
															value: '7',
														},
														{
															label: '08',
															value: '8',
														},
														{
															label: '09',
															value: '9',
														},
														{
															label: '10',
															value: '10',
														},
														{
															label: '11',
															value: '11',
														},
													] }
												/>
												<SelectControl
													name="period"
													__next40pxDefaultSize
													onBlur={ function noRefCheck() {} }
													onChange={ function noRefCheck() {} }
													onFocus={ function noRefCheck() {} }
													options={ [
														{
															label: 'AM',
															value: 'am',
														},
														{
															label: 'PM',
															value: 'pm',
														},
													] }
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
								options={ [
									{
										label: 'Weekly',
										value: 'weekly',
									},
								] }
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
												options={ [
													{
														label: 'Monday',
														value: 'a',
													},
													{
														label: 'Tuesday',
														value: 'b',
													},
													{
														label: 'Wednesday',
														value: 'c',
													},
													{
														label: 'Thursday',
														value: 'd',
													},
													{
														label: 'Friday',
														value: 'e',
													},
													{
														label: 'Saturday',
														value: 'f',
													},
													{
														label: 'Sunday',
														value: 'g',
													},
												] }
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
													options={ [
														{
															label: '00',
															value: '0',
														},
														{
															label: '01',
															value: '1',
														},
														{
															label: '02',
															value: '3',
														},
														{
															label: '03',
															value: '3',
														},
														{
															label: '04',
															value: '4',
														},
														{
															label: '05',
															value: '5',
														},
														{
															label: '06',
															value: '6',
														},
														{
															label: '07',
															value: '7',
														},
														{
															label: '08',
															value: '8',
														},
														{
															label: '09',
															value: '9',
														},
														{
															label: '10',
															value: '10',
														},
														{
															label: '11',
															value: '11',
														},
													] }
												/>
												<SelectControl
													name="period"
													__next40pxDefaultSize
													onBlur={ function noRefCheck() {} }
													onChange={ function noRefCheck() {} }
													onFocus={ function noRefCheck() {} }
													options={ [
														{
															label: 'AM',
															value: 'am',
														},
														{
															label: 'PM',
															value: 'pm',
														},
													] }
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
								{ data?.plugins.length <= MAX_SELECTABLE_PLUGINS && (
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
