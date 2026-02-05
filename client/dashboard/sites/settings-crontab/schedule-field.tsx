import {
	SelectControl,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export type ScheduleType = 'hourly' | 'twicedaily' | 'daily' | 'weekly';

interface ScheduleFieldProps {
	value: string;
	onChange: ( value: string ) => void;
	disabled?: boolean;
}

export const PREDEFINED_SCHEDULES = [
	{ value: 'hourly', label: __( 'Every hour' ) },
	{ value: 'twicedaily', label: __( 'Twice daily' ) },
	{ value: 'daily', label: __( 'Daily' ) },
	{ value: 'weekly', label: __( 'Weekly' ) },
];

/**
 * Parses a cron expression and returns the schedule type.
 *
 * Patterns:
 * - Hourly: `M * * * *`
 * - Twice daily: `M H1,H2 * * *`
 * - Daily: `M H * * *`
 * - Weekly: `M H * * D`
 */
export function parseScheduleValue( schedule: string ): ScheduleType {
	// If it's already a schedule type, return it
	if ( [ 'hourly', 'twicedaily', 'daily', 'weekly' ].includes( schedule ) ) {
		return schedule as ScheduleType;
	}

	const parts = schedule.trim().split( /\s+/ );

	if ( parts.length === 5 ) {
		const [ minute, hour, dayOfMonth, month, dayOfWeek ] = parts;

		// Hourly: specific minute, wildcard for everything else
		if (
			/^\d+$/.test( minute ) &&
			hour === '*' &&
			dayOfMonth === '*' &&
			month === '*' &&
			dayOfWeek === '*'
		) {
			return 'hourly';
		}

		// Twice daily: specific minute, two hours (comma-separated), wildcard for day/month/weekday
		if (
			/^\d+$/.test( minute ) &&
			/^\d+,\d+$/.test( hour ) &&
			dayOfMonth === '*' &&
			month === '*' &&
			dayOfWeek === '*'
		) {
			return 'twicedaily';
		}

		// Daily: specific minute and hour, wildcard for day/month/weekday
		if (
			/^\d+$/.test( minute ) &&
			/^\d+$/.test( hour ) &&
			dayOfMonth === '*' &&
			month === '*' &&
			dayOfWeek === '*'
		) {
			return 'daily';
		}

		// Weekly: specific minute, hour, and day of week
		if (
			/^\d+$/.test( minute ) &&
			/^\d+$/.test( hour ) &&
			dayOfMonth === '*' &&
			month === '*' &&
			/^\d+$/.test( dayOfWeek )
		) {
			return 'weekly';
		}
	}

	// Default to hourly for any unrecognized value
	return 'hourly';
}

function formatSchedulePreview( scheduleValue: string ): string {
	if ( scheduleValue === 'hourly' ) {
		return __( 'Runs once every hour.' );
	}
	if ( scheduleValue === 'twicedaily' ) {
		return __( 'Runs twice per day.' );
	}
	if ( scheduleValue === 'daily' ) {
		return __( 'Runs once per day.' );
	}
	if ( scheduleValue === 'weekly' ) {
		return __( 'Runs once per week.' );
	}

	return '';
}

export function ScheduleField( { value, onChange, disabled }: ScheduleFieldProps ) {
	const preview = formatSchedulePreview( value );

	return (
		<VStack spacing={ 3 }>
			<SelectControl
				label={ __( 'Schedule' ) }
				value={ value }
				options={ PREDEFINED_SCHEDULES }
				onChange={ ( newValue ) => {
					onChange( newValue );
				} }
				disabled={ disabled }
			/>
			{ preview && (
				<Text variant="muted" size={ 12 }>
					{ preview }{ ' ' }
					{ __( 'The specific execution time is randomized to prevent system overload.' ) }
				</Text>
			) }
		</VStack>
	);
}
