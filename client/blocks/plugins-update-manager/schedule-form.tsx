import {
	TextControl,
	RadioControl,
	SearchControl,
	SelectControl,
	CheckboxControl,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Flex,
	FlexItem,
	FlexBlock,
} from '@wordpress/components';
import { Icon, info } from '@wordpress/icons';
import classnames from 'classnames';
import { useState } from 'react';

import './schedule-form.scss';

export const ScheduleForm = () => {
	const [ name, setName ] = useState( '' );
	const [ frequency, setFrequency ] = useState( 'daily' );

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
						<TextControl id="name" value={ name } onChange={ setName } __next40pxDefaultSize />
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
											<label htmlFor="time">What time?</label>
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
											<label htmlFor="day">What day?</label>
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
											<label htmlFor="time">What time?</label>
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
						<label htmlFor="select-all">Select plugins</label>
						<span className="plugin-select-stats">10/10</span>
						<Text className="info-msg">
							Plugins not listed below are managed by WordPress.com and update automatically.
						</Text>
						<Text className="validation-msg">
							<Icon className="icon-info" icon={ info } size={ 16 } />
							Please pick another time for optimal performance, as this slot is already taken.
						</Text>
						<VStack className="checkbox-options">
							<SearchControl onChange={ function noRefCheck() {} } />
							<CheckboxControl
								id="select-all"
								__nextHasNoMarginBottom
								label="Select all"
								onChange={ function noRefCheck() {} }
							/>
							<CheckboxControl
								__nextHasNoMarginBottom
								label="Move to WordPress.com"
								onChange={ function noRefCheck() {} }
							/>
							<CheckboxControl
								__nextHasNoMarginBottom
								label="Akismet"
								onChange={ function noRefCheck() {} }
							/>
							<CheckboxControl
								__nextHasNoMarginBottom
								label="Advance custom fields"
								onChange={ function noRefCheck() {} }
							/>
							<CheckboxControl
								__nextHasNoMarginBottom
								label="Gravity forms"
								onChange={ function noRefCheck() {} }
							/>
						</VStack>
					</div>
				</FlexItem>
			</Flex>
		</form>
	);
};
