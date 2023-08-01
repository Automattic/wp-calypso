import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSelect from 'calypso/components/forms/form-select';

export function calculateTimeRange( selectedOption ) {
	const now = moment().unix();
	let start;
	let end;

	switch ( selectedOption ) {
		case '0':
			// 6 hours
			start = moment().subtract( 6, 'hours' ).unix();
			end = now;
			break;
		case '1':
			// 24 hours
			start = moment().subtract( 24, 'hours' ).unix();
			end = now;
			break;
		case '2':
			// 3 days
			start = moment().subtract( 3, 'days' ).unix();
			end = now;
			break;
		case '3':
			// 7 days
			start = moment().subtract( 7, 'days' ).unix();
			end = now;
			break;
		default:
			// Default to 6 hours in case of invalid selection
			start = moment().subtract( 6, 'hours' ).unix();
			end = now;
			break;
	}

	return { start, end };
}

export const TimeDateChartPicker = ( { onTimeRangeChange } ) => {
	const translate = useTranslate();
	const [ selectedOption, setSelectedOption ] = useState( '1' ); // Default selected option is '1'

	// Event handler to handle changes in the dropdown selection
	const handleSelectChange = ( event ) => {
		const newSelectedOption = event.target.value;
		setSelectedOption( newSelectedOption );

		// Calculate the time range and pass it back to the parent component
		const timeRange = calculateTimeRange( newSelectedOption );
		onTimeRangeChange( timeRange );
	};

	return (
		<FormFieldset>
			<FormLabel htmlFor="date_time_chart_picker">{ translate( 'Time range' ) }</FormLabel>
			<FormSelect
				name="date_time_chart_picker"
				id="date_time_chart_picker"
				onChange={ handleSelectChange }
				value={ selectedOption }
			>
				<option value="0">
					{ translate( '6 hours', { context: 'Time range for site metrics' } ) }
				</option>
				<option value="1">
					{ translate( '24 hours', { context: 'Time range for site metrics' } ) }
				</option>
				<option value="2">
					{ translate( '3 days', { context: 'Time range for site metrics' } ) }
				</option>
				<option value="3">
					{ translate( '7 days', { context: 'Time range for site metrics' } ) }
				</option>
			</FormSelect>
		</FormFieldset>
	);
};
