import { SelectControl } from '@wordpress/components';
import { useEffect, useState } from 'react';
import { HOUR_OPTIONS, HOUR_OPTIONS_24, PERIOD_OPTIONS } from './schedule-form.const';
import { convertHourTo12, convertHourTo24 } from './schedule-form.helper';

interface Props {
	hour: string;
	period: string;
	isAmPmFormat: boolean;
	onTouch?: ( touched: boolean ) => void;
	onChange: ( hour: string, period: string ) => void;
}
export function ScheduleFormTime( props: Props ) {
	const { hour: initHour, period: initPeriod, isAmPmFormat, onTouch, onChange } = props;

	const [ hour, setHour ] = useState(
		isAmPmFormat ? initHour : convertHourTo24( initHour, initPeriod )
	);
	const [ period, setPeriod ] = useState( initPeriod );
	const [ fieldTouched, setFieldTouched ] = useState( false );

	useEffect( () => {
		if ( isAmPmFormat ) {
			setHour( initHour );
		} else {
			setHour( convertHourTo24( initHour, initPeriod ) );
			setPeriod( parseInt( initHour ) < 12 ? 'am' : 'pm' );
		}
	}, [ initHour ] );

	useEffect( () => {
		setPeriod( initPeriod );
	}, [ initPeriod ] );
	useEffect( () => onTouch?.( fieldTouched ), [ fieldTouched ] );

	return (
		<div className="form-field">
			<div className="time-controls">
				<SelectControl
					__next40pxDefaultSize
					name="hour"
					value={ hour }
					options={ isAmPmFormat ? HOUR_OPTIONS : HOUR_OPTIONS_24 }
					onChange={ ( hour ) => {
						setHour( hour );
						setFieldTouched( true );

						if ( isAmPmFormat ) {
							onChange?.( hour, period );
						} else {
							const _hour = convertHourTo12( hour );
							const _period = parseInt( hour ) < 12 ? 'am' : 'pm';

							setPeriod( _period );
							onChange?.( _hour, _period );
						}
					} }
				/>
				{ isAmPmFormat && (
					<SelectControl
						__next40pxDefaultSize
						name="period"
						value={ period }
						options={ PERIOD_OPTIONS }
						onChange={ ( period ) => {
							setPeriod( period );
							setFieldTouched( true );
							onChange?.( hour, period );
						} }
					/>
				) }
			</div>
		</div>
	);
}
