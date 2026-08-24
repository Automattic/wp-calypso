/* eslint-disable no-restricted-imports */
import { FormLabel } from '@automattic/components';
import { Reader } from '@automattic/data-stores';
import {
	applyDeliveryWindowEdit,
	getDeliveryHourPickerHours,
	getDisplayDeliveryWindow,
	useDeliveryWindowTimezone,
} from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { FormEvent, FormEventHandler, useCallback } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import './styles.scss';

type DeliveryWindowInputProps = {
	dayValue: Reader.DeliveryWindowDayType;
	hourValue: Reader.DeliveryWindowHourType;
	onDayChange: FormEventHandler< HTMLSelectElement >;
	onHourChange: FormEventHandler< HTMLSelectElement >;
};

const padHour = ( hour: number ) => String( hour % 24 ).padStart( 2, '0' );

const DeliveryWindowInput = ( {
	dayValue,
	hourValue,
	onDayChange,
	onHourChange,
}: DeliveryWindowInputProps ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const { offsetHours, isUtcFallback, timezone } = useDeliveryWindowTimezone();

	// The stored day/hour are UTC. Show them in the device's local time, and
	// convert edits back to UTC for the caller. Fall back to raw UTC values
	// (clearly labeled) when the time zone can't be detected.
	const storedUtc = { hour: hourValue, day: dayValue };
	const displayWindow = getDisplayDeliveryWindow( storedUtc, offsetHours );

	const getLabel = useCallback(
		( hour: number ) => {
			if ( isUtcFallback ) {
				return translate( '%(fromHour)s:00 - %(toHour)s:00 UTC', {
					context: 'Hour range (in UTC) between which subscriptions are delivered',
					args: {
						fromHour: padHour( hour ),
						toHour: padHour( hour + 2 ),
					},
				} );
			}

			return translate( '%(fromHour)s - %(toHour)s', {
				context: 'Hour range between which subscriptions are delivered',
				args: {
					fromHour: moment().hour( hour ).minute( 0 ).format( 'LT' ),
					toHour: moment()
						.hour( hour + 2 )
						.minute( 0 )
						.format( 'LT' ),
				},
			} );
		},
		[ isUtcFallback, moment, translate ]
	);

	const orderedWeekDays = moment.weekdays( true );

	const getDayValue = useCallback(
		( day: string ) => moment().day( day ).locale( 'en' ).weekday(),
		[ moment ]
	);

	// Emit a synthetic change to the caller's single-field handlers. Both the
	// day and hour are emitted together because converting a local edit back to
	// UTC can wrap the day across midnight.
	const emitUtcWindow = useCallback(
		( utc: { hour: number; day: number } ) => {
			const syntheticEvent = ( value: number ) =>
				( {
					currentTarget: { value: String( value ) },
				} ) as unknown as FormEvent< HTMLSelectElement >;
			onHourChange( syntheticEvent( utc.hour ) );
			onDayChange( syntheticEvent( utc.day ) );
		},
		[ onDayChange, onHourChange ]
	);

	const handleDayChange: FormEventHandler< HTMLSelectElement > = ( evt ) => {
		emitUtcWindow(
			applyDeliveryWindowEdit(
				storedUtc,
				{ day: parseInt( evt.currentTarget.value, 10 ) || 0 },
				offsetHours
			)
		);
	};

	const handleHourChange: FormEventHandler< HTMLSelectElement > = ( evt ) => {
		emitUtcWindow(
			applyDeliveryWindowEdit(
				storedUtc,
				{ hour: parseInt( evt.currentTarget.value, 10 ) || 0 },
				offsetHours
			)
		);
	};

	return (
		<FormFieldset className="delivery-window-input">
			<FormLabel htmlFor="delivery_window_day">
				{ translate( 'Daily/weekly delivery window' ) }
			</FormLabel>
			<div className="select-row">
				<FormSelect
					name="delivery_window_day"
					onChange={ handleDayChange }
					value={ displayWindow.day }
				>
					{ orderedWeekDays.map( ( weekDay: string ) => (
						<option key={ weekDay } value={ getDayValue( weekDay ) }>
							{ weekDay }
						</option>
					) ) }
				</FormSelect>
				<FormSelect
					name="delivery_window_hour"
					onChange={ handleHourChange }
					value={ displayWindow.hour }
				>
					{ getDeliveryHourPickerHours( displayWindow.hour, isUtcFallback ).map( ( hour ) => (
						<option key={ hour } value={ hour }>
							{ getLabel( hour ) }
						</option>
					) ) }
				</FormSelect>
			</div>
			<div className="field-tip">
				<span className="tip-icon" />
				<span className="tip-text">
					{ translate(
						'Your emails will be sent out at this day and time once you choose a daily or weekly delivery'
					) }{ ' ' }
					{ isUtcFallback || ! timezone
						? translate( "We couldn't detect your time zone, so these times are shown in UTC." )
						: translate( 'Times are shown in your local time zone (%(timezone)s).', {
								args: { timezone },
						  } ) }
				</span>
			</div>
		</FormFieldset>
	);
};

export default DeliveryWindowInput;
