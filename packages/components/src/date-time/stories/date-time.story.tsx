/**
 * External dependencies
 */
import type { Meta, StoryFn } from '@storybook/react';

/**
 * WordPress dependencies
 */
import { useState, useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import DateTimePicker from '../date-time';
import { daysFromNow, isWeekend } from './utils';

const meta: Meta< typeof DateTimePicker > = {
	title: 'Components/Selection & Input/Time & Date/DateTimePicker',
	id: 'components-datetimepicker',
	component: DateTimePicker,
	argTypes: {
		currentDate: { control: 'date' },
		onChange: { action: 'onChange', control: false },
	},
	parameters: {
		controls: { expanded: true },
		docs: { canvas: { sourceState: 'shown' } },
	},
};
export default meta;

const Template: StoryFn< typeof DateTimePicker > = ( {
	currentDate,
	onChange,
	...args
} ) => {
	const [ date, setDate ] = useState( currentDate );
	useEffect( () => {
		setDate( currentDate );
	}, [ currentDate ] );
	return (
		<DateTimePicker
			{ ...args }
			currentDate={ date }
			onChange={ ( newDate ) => {
				setDate( newDate );
				onChange?.( newDate );
			} }
		/>
	);
};

export const Default: StoryFn< typeof DateTimePicker > = Template.bind( {} );
Default.args = {
	currentDate: new Date(),
};

export const WithEvents: StoryFn< typeof DateTimePicker > = Template.bind( {} );
WithEvents.args = {
	currentDate: new Date(),
	events: [
		{ date: daysFromNow( 2 ) },
		{ date: daysFromNow( 4 ) },
		{ date: daysFromNow( 6 ) },
		{ date: daysFromNow( 8 ) },
	],
};

export const WithInvalidDates: StoryFn< typeof DateTimePicker > = Template.bind(
	{}
);
WithInvalidDates.args = {
	currentDate: new Date(),
	isInvalidDate: isWeekend,
};
