/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import {
	TimeWrapper,
	TimeSeparator,
	HoursInput,
	MinutesInput,
	Fieldset,
} from '../styles';
import { HStack } from '../../../h-stack';
import {
	from12hTo24h,
	from24hTo12h,
	buildPadInputStateReducer,
	validateInputElementTarget,
} from '../../utils';
import type { TimeInputProps } from '../../types';
import type { InputChangeCallback } from '../../../input-control/types';
import { useControlledValue } from '../../../utils';
import BaseControl from '../../../base-control';
import {
	ToggleGroupControl,
	ToggleGroupControlOption,
} from '../../../toggle-group-control';

export function TimeInput( {
	value: valueProp,
	defaultValue,
	is12Hour,
	label,
	minutesProps,
	onChange,
}: TimeInputProps ) {
	const [
		value = {
			hours: new Date().getHours(),
			minutes: new Date().getMinutes(),
		},
		setValue,
	] = useControlledValue( {
		value: valueProp,
		onChange,
		defaultValue,
	} );
	const dayPeriod = parseDayPeriod( value.hours );
	const hours12Format = from24hTo12h( value.hours );

	const buildNumberControlChangeCallback = (
		method: 'hours' | 'minutes'
	): InputChangeCallback => {
		return ( _value, { event } ) => {
			if ( ! validateInputElementTarget( event ) ) {
				return;
			}

			// We can safely assume value is a number if target is valid.
			const numberValue = Number( _value );

			setValue( {
				...value,
				[ method ]:
					method === 'hours' && is12Hour
						? from12hTo24h( numberValue, dayPeriod === 'PM' )
						: numberValue,
			} );
		};
	};

	const buildAmPmChangeCallback = ( _value: 'AM' | 'PM' ) => {
		return () => {
			if ( dayPeriod === _value ) {
				return;
			}

			setValue( {
				...value,
				hours: from12hTo24h( hours12Format, _value === 'PM' ),
			} );
		};
	};

	function parseDayPeriod( _hours: number ) {
		return _hours < 12 ? 'AM' : 'PM';
	}

	const Wrapper = label ? Fieldset : Fragment;

	return (
		<Wrapper>
			{ label && (
				<BaseControl.VisualLabel as="legend">
					{ label }
				</BaseControl.VisualLabel>
			) }

			<HStack alignment="left" expanded={ false }>
				<TimeWrapper
					className="components-datetime__time-field components-datetime__time-field-time" // Unused, for backwards compatibility.
				>
					<HoursInput
						className="components-datetime__time-field-hours-input" // Unused, for backwards compatibility.
						label={ __( 'Hours' ) }
						hideLabelFromVision
						__next40pxDefaultSize
						value={ String(
							is12Hour ? hours12Format : value.hours
						).padStart( 2, '0' ) }
						step={ 1 }
						min={ is12Hour ? 1 : 0 }
						max={ is12Hour ? 12 : 23 }
						required
						spinControls="none"
						isPressEnterToChange
						isDragEnabled={ false }
						isShiftStepEnabled={ false }
						onChange={ buildNumberControlChangeCallback( 'hours' ) }
						__unstableStateReducer={ buildPadInputStateReducer(
							2
						) }
					/>
					<TimeSeparator
						className="components-datetime__time-separator" // Unused, for backwards compatibility.
						aria-hidden="true"
					>
						:
					</TimeSeparator>
					<MinutesInput
						className={ clsx(
							'components-datetime__time-field-minutes-input', // Unused, for backwards compatibility.
							minutesProps?.className
						) }
						label={ __( 'Minutes' ) }
						hideLabelFromVision
						__next40pxDefaultSize
						value={ String( value.minutes ).padStart( 2, '0' ) }
						step={ 1 }
						min={ 0 }
						max={ 59 }
						required
						spinControls="none"
						isPressEnterToChange
						isDragEnabled={ false }
						isShiftStepEnabled={ false }
						onChange={ ( ...args ) => {
							buildNumberControlChangeCallback( 'minutes' )(
								...args
							);
							minutesProps?.onChange?.( ...args );
						} }
						__unstableStateReducer={ buildPadInputStateReducer(
							2
						) }
						{ ...minutesProps }
					/>
				</TimeWrapper>
				{ is12Hour && (
					<ToggleGroupControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						isBlock
						label={ __( 'Select AM or PM' ) }
						hideLabelFromVision
						value={ dayPeriod }
						onChange={ ( newValue ) => {
							buildAmPmChangeCallback(
								newValue as 'AM' | 'PM'
							)();
						} }
					>
						<ToggleGroupControlOption
							value="AM"
							label={ __( 'AM' ) }
						/>
						<ToggleGroupControlOption
							value="PM"
							label={ __( 'PM' ) }
						/>
					</ToggleGroupControl>
				) }
			</HStack>
		</Wrapper>
	);
}
export default TimeInput;
