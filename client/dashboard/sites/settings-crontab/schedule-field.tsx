import {
	SelectControl,
	TextControl,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __, _n } from '@wordpress/i18n';
import { useMemo } from 'react';
import { parseSchedule, PREDEFINED_SCHEDULES } from './schedules';
import { ScheduleType, CustomFrequency } from './types';

interface ScheduleFieldProps {
	value: string;
	onChange: ( value: string ) => void;
	disabled?: boolean;
}

function getFrequencyOptions( number: number ): { value: CustomFrequency; label: string }[] {
	return [
		{
			value: 'h',
			label: _n( 'time per hour', 'times per hour', number ),
		},
		{
			value: 'd',
			label: _n( 'time per day', 'times per day', number ),
		},
		{
			value: 'w',
			label: _n( 'time per week', 'times per week', number ),
		},
	];
}

const FREQUENCY_MAX: Record< CustomFrequency, number > = {
	h: 12,
	d: 23,
	w: 6,
};

export function ScheduleField( { value, onChange, disabled }: ScheduleFieldProps ) {
	const parsed = useMemo( () => parseSchedule( value ), [ value ] );
	const { scheduleType, customNumber, customFrequency } = parsed;

	const frequencyOptions = useMemo( () => getFrequencyOptions( customNumber ), [ customNumber ] );

	return (
		<VStack spacing={ 3 }>
			<SelectControl
				label={ __( 'Schedule' ) }
				value={ scheduleType }
				options={ PREDEFINED_SCHEDULES }
				onChange={ ( newValue ) => {
					const newScheduleType = newValue as ScheduleType;
					if ( newScheduleType === 'custom' ) {
						onChange( `${ customNumber }${ customFrequency }` );
					} else {
						onChange( newScheduleType );
					}
				} }
				disabled={ disabled }
			/>
			{ scheduleType === 'custom' && (
				<HStack spacing={ 2 } alignment="bottom" justify="flex-start">
					<TextControl
						label={ __( 'Custom schedule' ) }
						hideLabelFromVision
						style={ { width: '80px' } }
						disabled={ disabled }
						type="number"
						min={ 1 }
						max={ FREQUENCY_MAX[ customFrequency ] }
						value={ String( customNumber ) }
						onChange={ ( newValue ) => {
							const num = parseInt( newValue, 10 );

							if ( ! isNaN( num ) && num >= 1 && num <= FREQUENCY_MAX[ customFrequency ] ) {
								onChange( `${ num }${ customFrequency }` );
							} else if ( newValue === '' ) {
								onChange( `1${ customFrequency }` );
							}
						} }
					/>
					<SelectControl
						label={ __( 'Frequency' ) }
						hideLabelFromVision
						disabled={ disabled }
						value={ customFrequency }
						options={ frequencyOptions }
						onChange={ ( newValue ) => {
							const freq = newValue as CustomFrequency;

							const clampedNumber =
								customNumber > FREQUENCY_MAX[ freq ] ? FREQUENCY_MAX[ freq ] : customNumber;
							onChange( `${ clampedNumber }${ freq }` );
						} }
					/>
				</HStack>
			) }
			<Text variant="muted" size={ 12 }>
				{ __( 'The specific execution time is randomized to prevent system overload.' ) }
			</Text>
		</VStack>
	);
}
