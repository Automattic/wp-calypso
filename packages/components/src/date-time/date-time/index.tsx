/**
 * External dependencies
 */
import type { ForwardedRef } from 'react';

/**
 * WordPress dependencies
 */
import { forwardRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { default as DatePicker } from '../date';
import { default as TimePicker } from '../time';
import type { DateTimePickerProps } from '../types';
import { Wrapper } from './styles';

export { DatePicker, TimePicker };

const noop = () => {};

function UnforwardedDateTimePicker(
	{
		currentDate,
		is12Hour,
		dateOrder,
		isInvalidDate,
		onMonthPreviewed = noop,
		onChange,
		events,
		startOfWeek,
	}: DateTimePickerProps,
	ref: ForwardedRef< any >
) {
	return (
		<Wrapper ref={ ref } className="components-datetime" spacing={ 4 }>
			<>
				<TimePicker
					currentTime={ currentDate }
					onChange={ onChange }
					is12Hour={ is12Hour }
					dateOrder={ dateOrder }
				/>
				<DatePicker
					currentDate={ currentDate }
					onChange={ onChange }
					isInvalidDate={ isInvalidDate }
					events={ events }
					onMonthPreviewed={ onMonthPreviewed }
					startOfWeek={ startOfWeek }
				/>
			</>
		</Wrapper>
	);
}

/**
 * DateTimePicker is a React component that renders a calendar and clock for
 * date and time selection. The calendar and clock components can be accessed
 * individually using the `DatePicker` and `TimePicker` components respectively.
 *
 * ```jsx
 * import { DateTimePicker } from '@wordpress/components';
 * import { useState } from '@wordpress/element';
 *
 * const MyDateTimePicker = () => {
 *   const [ date, setDate ] = useState( new Date() );
 *
 *   return (
 *     <DateTimePicker
 *       currentDate={ date }
 *       onChange={ ( newDate ) => setDate( newDate ) }
 *       is12Hour
 *     />
 *   );
 * };
 * ```
 */
export const DateTimePicker = forwardRef( UnforwardedDateTimePicker );

export default DateTimePicker;
