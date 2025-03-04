/**
 * External dependencies
 */
import { useState, useEffect } from '@wordpress/element';
/**
 * Internal dependencies
 */
import DatePicker from '../calendar';
import { daysFromNow, isWeekend } from './utils';
/**
 * Types
 */
import type { Meta, StoryFn } from '@storybook/react';

const meta: Meta< typeof DatePicker > = {
	title: 'packages/components/Calendar',
	id: 'packages-components-datepicker',
	component: DatePicker,
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

const Template: StoryFn< typeof DatePicker > = ( { currentDate, onChange, ...args } ) => {
	const [ date, setDate ] = useState( currentDate );
	useEffect( () => {
		setDate( currentDate );
	}, [ currentDate ] );
	return (
		<DatePicker
			{ ...args }
			currentDate={ date }
			onChange={ ( newDate ) => {
				setDate( newDate );
				onChange?.( newDate );
			} }
		/>
	);
};

export const Default: StoryFn< typeof DatePicker > = Template.bind( {} );
Default.args = {
	currentDate: new Date(),
};

export const WithEvents: StoryFn< typeof DatePicker > = Template.bind( {} );
WithEvents.args = {
	currentDate: new Date(),
	events: [
		{ date: daysFromNow( 2 ) },
		{ date: daysFromNow( 4 ) },
		{ date: daysFromNow( 6 ) },
		{ date: daysFromNow( 8 ) },
	],
};

export const WithInvalidDates: StoryFn< typeof DatePicker > = Template.bind( {} );
WithInvalidDates.args = {
	currentDate: new Date(),
	isInvalidDate: isWeekend,
};
