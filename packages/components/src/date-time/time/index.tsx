/**
 * External dependencies
 */
import { startOfMinute, format, set, setMonth } from 'date-fns';

/**
 * WordPress dependencies
 */
import { useState, useMemo, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import BaseControl from '../../base-control';
import { VisuallyHidden } from '../../visually-hidden';
import SelectControl from '../../select-control';
import TimeZone from './timezone';
import type { TimeInputValue, TimePickerProps } from '../types';
import {
	Wrapper,
	Fieldset,
	MonthSelectWrapper,
	DayInput,
	YearInput,
} from './styles';
import { HStack } from '../../h-stack';
import { Spacer } from '../../spacer';
import type { InputChangeCallback } from '../../input-control/types';
import {
	inputToDate,
	buildPadInputStateReducer,
	validateInputElementTarget,
} from '../utils';
import { TIMEZONELESS_FORMAT } from '../constants';
import { TimeInput } from './time-input';

const VALID_DATE_ORDERS = [ 'dmy', 'mdy', 'ymd' ];

/**
 * TimePicker is a React component that renders a clock for time selection.
 *
 * ```jsx
 * import { TimePicker } from '@wordpress/components';
 * import { useState } from '@wordpress/element';
 *
 * const MyTimePicker = () => {
 *   const [ time, setTime ] = useState( new Date() );
 *
 *   return (
 *     <TimePicker
 *       currentTime={ date }
 *       onChange={ ( newTime ) => setTime( newTime ) }
 *       is12Hour
 *     />
 *   );
 * };
 * ```
 */
export function TimePicker( {
	is12Hour,
	currentTime,
	onChange,
	dateOrder: dateOrderProp,
	hideLabelFromVision = false,
}: TimePickerProps ) {
	const [ date, setDate ] = useState( () =>
		// Truncate the date at the minutes, see: #15495.
		currentTime ? startOfMinute( inputToDate( currentTime ) ) : new Date()
	);

	// Reset the state when currentTime changed.
	// TODO: useEffect() shouldn't be used like this, causes an unnecessary render
	useEffect( () => {
		setDate(
			currentTime
				? startOfMinute( inputToDate( currentTime ) )
				: new Date()
		);
	}, [ currentTime ] );

	const monthOptions = [
		{ value: '01', label: __( 'January' ) },
		{ value: '02', label: __( 'February' ) },
		{ value: '03', label: __( 'March' ) },
		{ value: '04', label: __( 'April' ) },
		{ value: '05', label: __( 'May' ) },
		{ value: '06', label: __( 'June' ) },
		{ value: '07', label: __( 'July' ) },
		{ value: '08', label: __( 'August' ) },
		{ value: '09', label: __( 'September' ) },
		{ value: '10', label: __( 'October' ) },
		{ value: '11', label: __( 'November' ) },
		{ value: '12', label: __( 'December' ) },
	] as const;

	const { day, month, year, minutes, hours } = useMemo(
		() => ( {
			day: format( date, 'dd' ),
			month: format(
				date,
				'MM'
			) as ( typeof monthOptions )[ number ][ 'value' ],
			year: format( date, 'yyyy' ),
			minutes: format( date, 'mm' ),
			hours: format( date, 'HH' ),
			am: format( date, 'a' ),
		} ),
		[ date ]
	);

	const buildNumberControlChangeCallback = ( method: 'date' | 'year' ) => {
		const callback: InputChangeCallback = ( value, { event } ) => {
			if ( ! validateInputElementTarget( event ) ) {
				return;
			}

			// We can safely assume value is a number if target is valid.
			const numberValue = Number( value );

			const newDate = set( date, { [ method ]: numberValue } );
			setDate( newDate );
			onChange?.( format( newDate, TIMEZONELESS_FORMAT ) );
		};
		return callback;
	};

	const onTimeInputChangeCallback = ( {
		hours: newHours,
		minutes: newMinutes,
	}: TimeInputValue ) => {
		const newDate = set( date, {
			hours: newHours,
			minutes: newMinutes,
		} );
		setDate( newDate );
		onChange?.( format( newDate, TIMEZONELESS_FORMAT ) );
	};

	const dayField = (
		<DayInput
			key="day"
			className="components-datetime__time-field components-datetime__time-field-day" // Unused, for backwards compatibility.
			label={ __( 'Day' ) }
			hideLabelFromVision
			__next40pxDefaultSize
			value={ day }
			step={ 1 }
			min={ 1 }
			max={ 31 }
			required
			spinControls="none"
			isPressEnterToChange
			isDragEnabled={ false }
			isShiftStepEnabled={ false }
			onChange={ buildNumberControlChangeCallback( 'date' ) }
		/>
	);

	const monthField = (
		<MonthSelectWrapper key="month">
			<SelectControl
				className="components-datetime__time-field components-datetime__time-field-month" // Unused, for backwards compatibility.
				label={ __( 'Month' ) }
				hideLabelFromVision
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				value={ month }
				options={ monthOptions }
				onChange={ ( value ) => {
					const newDate = setMonth( date, Number( value ) - 1 );
					setDate( newDate );
					onChange?.( format( newDate, TIMEZONELESS_FORMAT ) );
				} }
			/>
		</MonthSelectWrapper>
	);

	const yearField = (
		<YearInput
			key="year"
			className="components-datetime__time-field components-datetime__time-field-year" // Unused, for backwards compatibility.
			label={ __( 'Year' ) }
			hideLabelFromVision
			__next40pxDefaultSize
			value={ year }
			step={ 1 }
			min={ 1 }
			max={ 9999 }
			required
			spinControls="none"
			isPressEnterToChange
			isDragEnabled={ false }
			isShiftStepEnabled={ false }
			onChange={ buildNumberControlChangeCallback( 'year' ) }
			__unstableStateReducer={ buildPadInputStateReducer( 4 ) }
		/>
	);

	const defaultDateOrder = is12Hour ? 'mdy' : 'dmy';
	const dateOrder =
		dateOrderProp && VALID_DATE_ORDERS.includes( dateOrderProp )
			? dateOrderProp
			: defaultDateOrder;

	const fields = dateOrder.split( '' ).map( ( field ) => {
		switch ( field ) {
			case 'd':
				return dayField;
			case 'm':
				return monthField;
			case 'y':
				return yearField;
			default:
				return null;
		}
	} );

	return (
		<Wrapper
			className="components-datetime__time" // Unused, for backwards compatibility.
		>
			<Fieldset>
				{ hideLabelFromVision ? (
					<VisuallyHidden as="legend">
						{ __( 'Time' ) }
					</VisuallyHidden>
				) : (
					<BaseControl.VisualLabel
						as="legend"
						className="components-datetime__time-legend" // Unused, for backwards compatibility.
					>
						{ __( 'Time' ) }
					</BaseControl.VisualLabel>
				) }
				<HStack
					className="components-datetime__time-wrapper" // Unused, for backwards compatibility.
				>
					<TimeInput
						value={ {
							hours: Number( hours ),
							minutes: Number( minutes ),
						} }
						is12Hour={ is12Hour }
						onChange={ onTimeInputChangeCallback }
					/>
					<Spacer />
					<TimeZone />
				</HStack>
			</Fieldset>
			<Fieldset>
				{ hideLabelFromVision ? (
					<VisuallyHidden as="legend">
						{ __( 'Date' ) }
					</VisuallyHidden>
				) : (
					<BaseControl.VisualLabel
						as="legend"
						className="components-datetime__time-legend" // Unused, for backwards compatibility.
					>
						{ __( 'Date' ) }
					</BaseControl.VisualLabel>
				) }
				<HStack
					className="components-datetime__time-wrapper" // Unused, for backwards compatibility.
				>
					{ fields }
				</HStack>
			</Fieldset>
		</Wrapper>
	);
}

/**
 * A component to input a time.
 *
 * Values are passed as an object in 24-hour format (`{ hours: number, minutes: number }`).
 *
 * ```jsx
 * import { TimePicker } from '@wordpress/components';
 * import { useState } from '@wordpress/element';
 *
 * const MyTimeInput = () => {
 * 	const [ time, setTime ] = useState( { hours: 13, minutes: 30 } );
 *
 * 	return (
 * 		<TimePicker.TimeInput
 * 			value={ time }
 * 			onChange={ setTime }
 * 			label="Time"
 * 		/>
 * 	);
 * };
 * ```
 */
TimePicker.TimeInput = TimeInput;
Object.assign( TimePicker.TimeInput, { displayName: 'TimePicker.TimeInput' } );

export default TimePicker;
