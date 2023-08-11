/* eslint-disable no-restricted-imports */
import { FormLabel } from '@automattic/components';
import { Reader } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { FormEventHandler, useCallback } from 'react';
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

const DeliveryWindowInput = ( {
	dayValue,
	hourValue,
	onDayChange,
	onHourChange,
}: DeliveryWindowInputProps ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	const getLabel = useCallback(
		( hour: number ) =>
			translate( '%(fromHour)s - %(toHour)s', {
				context: 'Hour range between which subscriptions are delivered',
				args: {
					fromHour: moment().hour( hour ).minute( 0 ).format( 'LT' ),
					toHour: moment()
						.hour( hour + 2 )
						.minute( 0 )
						.format( 'LT' ),
				},
			} ),
		[ moment, translate ]
	);

	const orderedWeekDays = moment.weekdays( true );

	const getDayValue = useCallback(
		( day: string ) => moment().day( day ).locale( 'en' ).weekday(),
		[ moment ]
	);

	return (
		<FormFieldset className="delivery-window-input">
			<FormLabel htmlFor="delivery_window_day">
				{ translate( 'Daily/weekly delivery window' ) }
			</FormLabel>
			<div className="select-row">
				<FormSelect name="delivery_window_day" onChange={ onDayChange } value={ dayValue }>
					{ orderedWeekDays.map( ( weekDay: string ) => (
						<option key={ weekDay } value={ getDayValue( weekDay ) }>
							{ weekDay }
						</option>
					) ) }
				</FormSelect>
				<FormSelect name="delivery_window_hour" onChange={ onHourChange } value={ hourValue }>
					{ [ 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22 ].map( ( hour ) => (
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
					) }
				</span>
			</div>
		</FormFieldset>
	);
};

export default DeliveryWindowInput;
