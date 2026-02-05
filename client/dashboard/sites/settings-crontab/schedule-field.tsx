import {
	SelectControl,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

type ScheduleType = 'hourly' | 'twicedaily' | 'daily' | 'weekly';

interface ScheduleFieldProps {
	value: string;
	onChange: ( value: string ) => void;
	disabled?: boolean;
}

const PREDEFINED_SCHEDULES: { value: ScheduleType; label: string }[] = [
	{ value: 'hourly', label: __( 'Every hour' ) },
	{ value: 'twicedaily', label: __( 'Twice daily' ) },
	{ value: 'daily', label: __( 'Daily' ) },
	{ value: 'weekly', label: __( 'Weekly' ) },
];

function parseScheduleValue( value: string ): ScheduleType {
	if ( [ 'hourly', 'twicedaily', 'daily', 'weekly' ].includes( value ) ) {
		return value as ScheduleType;
	}

	// Default to hourly for any unrecognized value
	return 'hourly';
}

function formatSchedulePreview( scheduleType: ScheduleType ): string {
	if ( scheduleType === 'hourly' ) {
		return __( 'Runs once every hour.' );
	}
	if ( scheduleType === 'twicedaily' ) {
		return __( 'Runs twice per day.' );
	}
	if ( scheduleType === 'daily' ) {
		return __( 'Runs once per day.' );
	}
	if ( scheduleType === 'weekly' ) {
		return __( 'Runs once per week.' );
	}

	return '';
}

export function ScheduleField( { value, onChange, disabled }: ScheduleFieldProps ) {
	const scheduleType = parseScheduleValue( value );
	const preview = formatSchedulePreview( scheduleType );

	return (
		<VStack spacing={ 3 }>
			<SelectControl
				__nextHasNoMarginBottom
				label={ __( 'Schedule' ) }
				value={ scheduleType }
				options={ PREDEFINED_SCHEDULES }
				onChange={ ( newValue ) => {
					onChange( newValue as ScheduleType );
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
