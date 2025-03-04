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
import TimePicker from '../time';

const meta: Meta< typeof TimePicker > = {
	title: 'Components/Selection & Input/Time & Date/TimePicker',
	id: 'components-timepicker',
	component: TimePicker,
	// @ts-expect-error - See https://github.com/storybookjs/storybook/issues/23170
	subcomponents: { 'TimePicker.TimeInput': TimePicker.TimeInput },
	argTypes: {
		currentTime: { control: 'date' },
		onChange: { action: 'onChange', control: false },
	},
	parameters: {
		controls: { expanded: true },
		docs: { canvas: { sourceState: 'shown' } },
	},
};
export default meta;

const Template: StoryFn< typeof TimePicker > = ( {
	currentTime,
	onChange,
	...args
} ) => {
	const [ time, setTime ] = useState( currentTime );
	useEffect( () => {
		setTime( currentTime );
	}, [ currentTime ] );
	return (
		<TimePicker
			{ ...args }
			currentTime={ time }
			onChange={ ( newTime ) => {
				setTime( newTime );
				onChange?.( newTime );
			} }
		/>
	);
};

export const Default: StoryFn< typeof TimePicker > = Template.bind( {} );
Default.args = {
	currentTime: new Date(),
};

const TimeInputTemplate: StoryFn< typeof TimePicker.TimeInput > = ( args ) => {
	return <TimePicker.TimeInput { ...args } />;
};

/**
 * The time input can be used in isolation as `<TimePicker.TimeInput />`. In this case, the `value` will be passed
 * as an object in 24-hour format (`{ hours: number, minutes: number }`).
 */
export const TimeInput = TimeInputTemplate.bind( {} );
TimeInput.args = {
	label: 'Time',
};
// Hide TimePicker controls because they don't apply to TimeInput
TimeInput.parameters = { controls: { include: [] } };
