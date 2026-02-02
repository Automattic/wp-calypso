import {
	SelectControl,
	TextControl,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { useMemo } from 'react';

type ScheduleType = 'hourly' | 'daily' | 'weekly' | 'custom';
type CustomFrequency = 'h' | 'd' | 'w';

interface ScheduleFieldProps {
	value: string;
	onChange: ( value: string ) => void;
	disabled?: boolean;
}

const PREDEFINED_SCHEDULES: { value: ScheduleType; label: string }[] = [
	{ value: 'hourly', label: __( 'Every hour' ) },
	{ value: 'daily', label: __( 'Daily' ) },
	{ value: 'weekly', label: __( 'Weekly' ) },
	{ value: 'custom', label: __( 'Custom' ) },
];

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
	d: 24,
	w: 7,
};

function parseScheduleValue( value: string ): {
	scheduleType: ScheduleType;
	customNumber: number;
	customFrequency: CustomFrequency;
} {
	// Check if it's a predefined schedule
	if ( [ 'hourly', 'daily', 'weekly' ].includes( value ) ) {
		return {
			scheduleType: value as ScheduleType,
			customNumber: 1,
			customFrequency: 'h',
		};
	}

	// Check if it's shorthand notation (e.g., "2h", "6d", "3w")
	const shorthandMatch = value.match( /^(\d+)([hdw])$/ );
	if ( shorthandMatch ) {
		return {
			scheduleType: 'custom',
			customNumber: parseInt( shorthandMatch[ 1 ], 10 ),
			customFrequency: shorthandMatch[ 2 ] as CustomFrequency,
		};
	}

	// Default to custom with raw value
	return {
		scheduleType: 'custom',
		customNumber: 1,
		customFrequency: 'h',
	};
}

function formatSchedulePreview(
	scheduleType: ScheduleType,
	customNumber: number,
	customFrequency: CustomFrequency
): string {
	if ( scheduleType === 'hourly' ) {
		return __( 'Runs once every hour' );
	}
	if ( scheduleType === 'daily' ) {
		return __( 'Runs once per day' );
	}
	if ( scheduleType === 'weekly' ) {
		return __( 'Runs once per week' );
	}

	// Custom schedule
	if ( customFrequency === 'h' ) {
		if ( customNumber === 1 ) {
			return __( 'Runs once per hour' );
		}
		const interval = Math.floor( 60 / customNumber );
		return sprintf(
			/* translators: %1$d is the number of times, %2$d is the interval in minutes */
			__( 'Runs %1$d times per hour (every %2$d minutes)' ),
			customNumber,
			interval
		);
	}
	if ( customFrequency === 'd' ) {
		if ( customNumber === 1 ) {
			return __( 'Runs once per day' );
		}
		const interval = Math.floor( 24 / customNumber );
		return sprintf(
			/* translators: %1$d is the number of times, %2$d is the interval in hours */
			__( 'Runs %1$d times per day (every %2$d hours)' ),
			customNumber,
			interval
		);
	}
	if ( customFrequency === 'w' ) {
		if ( customNumber === 1 ) {
			return __( 'Runs once per week' );
		}
		const interval = Math.floor( 7 / customNumber );
		return sprintf(
			/* translators: %1$d is the number of times, %2$d is the interval in days */
			__( 'Runs %1$d times per week (every %2$d days)' ),
			customNumber,
			interval
		);
	}

	return '';
}

export default function ScheduleField( { value, onChange, disabled }: ScheduleFieldProps ) {
	const parsed = useMemo( () => parseScheduleValue( value ), [ value ] );

	const { scheduleType, customNumber, customFrequency } = parsed;

	const preview = formatSchedulePreview( scheduleType, customNumber, customFrequency );

	const frequencyOptions = useMemo( () => getFrequencyOptions( customNumber ), [ customNumber ] );

	return (
		<VStack spacing={ 3 }>
			<SelectControl
				__nextHasNoMarginBottom
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
						__nextHasNoMarginBottom
						label={ __( 'Custom schedule' ) }
						hideLabelFromVision
						value={ String( customNumber ) }
						onChange={ ( newValue ) => {
							const num = parseInt( newValue, 10 );
							if ( ! isNaN( num ) && num >= 1 && num <= FREQUENCY_MAX[ customFrequency ] ) {
								onChange( `${ num }${ customFrequency }` );
							} else if ( newValue === '' ) {
								onChange( `1${ customFrequency }` );
							}
						} }
						disabled={ disabled }
						type="number"
						min={ 1 }
						max={ FREQUENCY_MAX[ customFrequency ] }
						style={ { width: '80px' } }
					/>
					<SelectControl
						__nextHasNoMarginBottom
						label={ __( 'Frequency' ) }
						hideLabelFromVision
						value={ customFrequency }
						options={ frequencyOptions }
						onChange={ ( newValue ) => {
							const freq = newValue as CustomFrequency;
							// Clamp the number to the new max
							const clampedNumber =
								customNumber > FREQUENCY_MAX[ freq ] ? FREQUENCY_MAX[ freq ] : customNumber;
							onChange( `${ clampedNumber }${ freq }` );
						} }
						disabled={ disabled }
					/>
				</HStack>
			) }
			{ preview && (
				<Text variant="muted" size="small">
					{ preview }
				</Text>
			) }
		</VStack>
	);
}
