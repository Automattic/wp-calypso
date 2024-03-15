import { SelectControl } from '@wordpress/components';
import { useState } from 'react';
import { HOUR_OPTIONS, PERIOD_OPTIONS } from './schedule-form.const';

interface Props {
	initHour: string;
	initPeriod: string;
	onChange: ( hour: string, period: string ) => void;
}
export function ScheduleFormTime( props: Props ) {
	const { initHour, initPeriod, onChange } = props;

	const [ hour, setHour ] = useState( initHour );
	const [ period, setPeriod ] = useState( initPeriod );

	return (
		<div className="form-field">
			<div className="time-controls">
				<SelectControl
					__next40pxDefaultSize
					name="hour"
					value={ hour }
					options={ HOUR_OPTIONS }
					onChange={ ( hour ) => {
						setHour( hour );
						onChange?.( hour, period );
					} }
				/>
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
			</div>
		</div>
	);
}
