import { __, sprintf } from '@wordpress/i18n';
import cronstrue from 'cronstrue';
import { ScheduleType, CustomFrequency } from './types';

export const PREDEFINED_SCHEDULES: { value: ScheduleType; label: string }[] = [
	{ value: 'hourly', label: __( 'Every hour' ) },
	{ value: 'twicedaily', label: __( 'Twice daily' ) },
	{ value: 'daily', label: __( 'Daily' ) },
	{ value: 'weekly', label: __( 'Weekly' ) },
	{ value: 'custom', label: __( 'Custom' ) },
];

export function formatScheduleLabel( requestedSchedule: string ): string {
	const { scheduleType, customNumber, customFrequency } = parseSchedule( requestedSchedule );

	if ( [ 'hourly', 'twicedaily', 'daily', 'weekly' ].includes( scheduleType ) ) {
		return PREDEFINED_SCHEDULES.find( ( s ) => s.value === scheduleType )?.label ?? '';
	}

	// Custom schedule
	if ( customFrequency === 'h' ) {
		if ( customNumber === 1 ) {
			return PREDEFINED_SCHEDULES.find( ( s ) => s.value === 'hourly' )?.label ?? '';
		}
		return sprintf(
			/* translators: %1$d is the number of times cron job runs */
			__( '%1$d times per hour' ),
			customNumber
		);
	}
	if ( customFrequency === 'd' ) {
		if ( customNumber === 1 ) {
			return PREDEFINED_SCHEDULES.find( ( s ) => s.value === 'daily' )?.label ?? '';
		}
		return sprintf(
			/* translators: %1$d is the number of times cron job runs */
			__( '%1$d times per day' ),
			customNumber
		);
	}
	if ( customFrequency === 'w' ) {
		if ( customNumber === 1 ) {
			return PREDEFINED_SCHEDULES.find( ( s ) => s.value === 'weekly' )?.label ?? '';
		}
		return sprintf(
			/* translators: %1$d is the number of times cron job runs */
			__( '%1$d times per week' ),
			customNumber
		);
	}

	return '';
}

export function formatScheduleDescription(
	requestedSchedule: string,
	rawSchedule: string,
	locale: string
): string {
	if ( [ 'hourly', 'twicedaily', 'daily', 'weekly' ].includes( requestedSchedule ) ) {
		return cronstrue.toString( rawSchedule, {
			verbose: true,
			locale,
		} );
	}

	const { customNumber, customFrequency } = parseSchedule( requestedSchedule );

	if ( customNumber === 1 ) {
		return cronstrue.toString( rawSchedule, {
			verbose: true,
			locale,
		} );
	}

	// Custom schedule
	if ( customFrequency === 'h' ) {
		return 60 % customNumber === 0
			? sprintf(
					/* translators: %1$d is the interval in minutes for running cron job */
					__( 'Every %1$d minutes' ),
					60 / customNumber
			  )
			: sprintf(
					/* translators: %1$s is the approximate interval in minutes for running cron job */
					__( 'Approximately every %1$s minutes' ),
					( 60 / customNumber ).toFixed( 1 )
			  );
	}
	if ( customFrequency === 'd' ) {
		return 24 % customNumber === 0
			? sprintf(
					/* translators: %1$d is the interval in hours for running cron job */
					__( 'Every %1$d hours' ),
					24 / customNumber
			  )
			: sprintf(
					/* translators: %1$s is the approximate interval in hours for running cron job */
					__( 'Approximately every %1$s hours' ),
					( 24 / customNumber ).toFixed( 1 )
			  );
	}
	if ( customFrequency === 'w' ) {
		return sprintf(
			/* translators: %1$s is the approximate interval in days for running cron job */
			__( 'Approximately every %1$s days' ),
			( 7 / customNumber ).toFixed( 1 )
		);
	}

	return cronstrue.toString( rawSchedule, {
		verbose: true,
		locale,
	} );
}

export function parseSchedule( value: string ): {
	scheduleType: ScheduleType;
	customNumber: number;
	customFrequency: CustomFrequency;
} {
	// Check if it's a predefined schedule
	if ( [ 'hourly', 'twicedaily', 'daily', 'weekly' ].includes( value ) ) {
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
