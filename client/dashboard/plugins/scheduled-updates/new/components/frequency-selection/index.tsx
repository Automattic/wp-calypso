import {
	Card,
	CardBody,
	CardHeader,
	RadioControl,
	SelectControl,
	TextControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export type Weekday =
	| 'Monday'
	| 'Tuesday'
	| 'Wednesday'
	| 'Thursday'
	| 'Friday'
	| 'Saturday'
	| 'Sunday';

type Props = {
	frequency: 'daily' | 'weekly';
	weekday: Weekday;
	time: string; // HH:MM 24h
	onChange: ( next: { frequency: 'daily' | 'weekly'; weekday: Weekday; time: string } ) => void;
};

export function PluginsScheduleNewFrequency( { frequency, weekday, time, onChange }: Props ) {
	const isTimeValid = /^([01]\d|2[0-3]):[0-5]\d$/.test( time );

	return (
		<Card>
			<CardHeader>
				<strong>{ __( 'Select frequency' ) }</strong>
			</CardHeader>
			<CardBody>
				<fieldset>
					<legend className="screen-reader-text">{ __( 'Schedule frequency' ) }</legend>
					<RadioControl
						label={ __( 'Frequency' ) }
						selected={ frequency }
						onChange={ ( val: string ) =>
							onChange( { frequency: val === 'weekly' ? 'weekly' : 'daily', weekday, time } )
						}
						options={ [
							{ label: __( 'Daily' ), value: 'daily' },
							{ label: __( 'Weekly' ), value: 'weekly' },
						] }
					/>
					{ frequency === 'weekly' && (
						<SelectControl
							label={ __( 'Weekday' ) }
							value={ weekday }
							onChange={ ( val: string ) =>
								onChange( { frequency, weekday: val as Weekday, time } )
							}
							options={ [
								{ label: __( 'Monday' ), value: 'Monday' },
								{ label: __( 'Tuesday' ), value: 'Tuesday' },
								{ label: __( 'Wednesday' ), value: 'Wednesday' },
								{ label: __( 'Thursday' ), value: 'Thursday' },
								{ label: __( 'Friday' ), value: 'Friday' },
								{ label: __( 'Saturday' ), value: 'Saturday' },
								{ label: __( 'Sunday' ), value: 'Sunday' },
							] }
						/>
					) }
					<TextControl
						label={ __( 'Time (HH:MM)' ) }
						value={ time }
						onChange={ ( val: string ) => onChange( { frequency, weekday, time: val } ) }
						help={ isTimeValid ? undefined : __( 'Enter a valid 24h time, e.g. 04:00' ) }
					/>
				</fieldset>
			</CardBody>
		</Card>
	);
}
