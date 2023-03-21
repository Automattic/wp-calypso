/* eslint-disable no-restricted-imports */
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { FormEventHandler, useCallback } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSelect from 'calypso/components/forms/form-select';
import './styles.scss';

export type DeliveryWindowDayType = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type DeliveryWindowHourType = 0 | 2 | 4 | 6 | 8 | 10 | 12 | 14 | 16 | 18 | 20 | 22;

type DeliveryWindowInputProps = {
	dayValue: DeliveryWindowDayType;
	hourValue: DeliveryWindowHourType;
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

	const getLabel = useCallback(
		( hour ) =>
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
		[ translate ]
	);

	return (
		<FormFieldset className="delivery-window-input">
			<FormLabel htmlFor="delivery_window_day">
				{ translate( 'Daily/weekly delivery window' ) }
			</FormLabel>
			<div className="select-row">
				<FormSelect name="delivery_window_day" onChange={ onDayChange } value={ dayValue }>
					<option value="0">{ translate( 'Sunday' ) }</option>
					<option value="1">{ translate( 'Monday' ) }</option>
					<option value="2">{ translate( 'Tuesday' ) }</option>
					<option value="3">{ translate( 'Wednesday' ) }</option>
					<option value="4">{ translate( 'Thursday' ) }</option>
					<option value="5">{ translate( 'Friday' ) }</option>
					<option value="6">{ translate( 'Saturday' ) }</option>
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
