import {
	Card,
	CardBody,
	RadioControl,
	SelectControl,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { Frequency, Weekday } from '../types';

type Props = {
	frequency: Frequency;
	weekday: Weekday;
	time: string; // HH:MM 24h
	onChange: ( next: { frequency: Frequency; weekday: Weekday; time: string } ) => void;
};

const HOUR_OPTIONS_24 = [ ...Array( 24 ).keys() ].map( ( i ) => ( {
	label: i.toString().padStart( 2, '0' ) + ':00',
	value: i.toString().padStart( 2, '0' ) + ':00',
} ) );

function ScheduledUpdatesFrequencySelection( { frequency, weekday, time, onChange }: Props ) {
	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<RadioControl
						selected={ frequency }
						onChange={ ( val: string ) =>
							onChange( { frequency: val === 'weekly' ? 'weekly' : 'daily', weekday, time } )
						}
						options={ [
							{ label: __( 'Daily' ), value: 'daily' },
							{ label: __( 'Weekly' ), value: 'weekly' },
						] }
					/>

					{ frequency === 'weekly' ? (
						<HStack spacing={ 6 } justify="space-between" alignment="start">
							<VStack spacing={ 2 } style={ { flex: 1 } }>
								<SelectControl
									label={ __( 'Select day' ) }
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
							</VStack>
							<VStack spacing={ 2 } style={ { flex: 1 } }>
								<SelectControl
									label={ __( 'Select time' ) }
									value={ time }
									onChange={ ( val: string ) => onChange( { frequency, weekday, time: val } ) }
									options={ HOUR_OPTIONS_24 }
								/>
							</VStack>
						</HStack>
					) : (
						<SelectControl
							label={ __( 'Select time' ) }
							value={ time }
							onChange={ ( val: string ) => onChange( { frequency, weekday, time: val } ) }
							options={ HOUR_OPTIONS_24 }
						/>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}

export default ScheduledUpdatesFrequencySelection;
