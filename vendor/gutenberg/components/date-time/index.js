/**
 * Internal dependencies
 */
import './style.scss';
import { default as DatePicker } from './date';
import { default as TimePicker } from './time';

export { DatePicker, TimePicker };

export function DateTimePicker( { currentDate, onChange, is12Hour, ...args } ) {
	return [
		<DatePicker
			key="date-picker"
			currentDate={ currentDate }
			onChange={ onChange }
			{ ...args }
		/>,
		<TimePicker
			key="time-picker"
			currentTime={ currentDate }
			onChange={ onChange }
			is12Hour={ is12Hour }
		/>,
	];
}
