/**
 * External dependencies
 */
import { useState, useEffect } from '@wordpress/element';
/**
 * Internal dependencies
 */
import Calendar from '../calendar';
import { daysFromNow, isWeekend } from './utils';
/**
 * Types
 */
import type { Meta, StoryFn } from '@storybook/react';

const meta: Meta< typeof Calendar > = {
	title: 'packages/components/Calendar',
	id: 'packages-components-calendar',
	component: Calendar,
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

const Template: StoryFn< typeof Calendar > = ( { currentDate, onChange, ...args } ) => {
	const [ date, setDate ] = useState( currentDate );
	useEffect( () => {
		setDate( currentDate );
	}, [ currentDate ] );
	return (
		<Calendar
			{ ...args }
			currentDate={ date }
			onChange={ ( newDate ) => {
				setDate( newDate );
				onChange?.( newDate );
			} }
		/>
	);
};

export const Default: StoryFn< typeof Calendar > = Template.bind( {} );
Default.args = {
	currentDate: new Date(),
};

export const WithEvents: StoryFn< typeof Calendar > = Template.bind( {} );
WithEvents.args = {
	currentDate: new Date(),
	events: [
		{ date: daysFromNow( 2 ) },
		{ date: daysFromNow( 4 ) },
		{ date: daysFromNow( 6 ) },
		{ date: daysFromNow( 8 ) },
	],
};

export const WithInvalidDates: StoryFn< typeof Calendar > = Template.bind( {} );
WithInvalidDates.args = {
	currentDate: new Date(),
	isInvalidDate: isWeekend,
};
