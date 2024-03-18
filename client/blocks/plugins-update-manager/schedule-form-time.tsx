import { SelectControl } from '@wordpress/components';
import { useState } from 'react';
import {
	convertHourTo12,
	convertHourTo24,
} from 'calypso/blocks/plugins-update-manager/schedule-form.helper';
import { HOUR_OPTIONS, HOUR_OPTIONS_24, PERIOD_OPTIONS } from './schedule-form.const';

interface Props {
	initHour: string;
	initPeriod: string;
	isAmPmFormat: boolean;
	onChange: ( hour: string, period: string ) => void;
}
export function ScheduleFormTime( props: Props ) {
	const { initHour, initPeriod, isAmPmFormat, onChange } = props;

	const [ hour, setHour ] = useState(
		isAmPmFormat ? initHour : convertHourTo24( initHour, initPeriod )
	);
	const [ period, setPeriod ] = useState( initPeriod );

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
							onChange?.( hour, period );
						} }
					/>
				) }
			</div>
		</div>
	);
}
