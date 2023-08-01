import { useTranslate } from 'i18n-calypso';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSelect from 'calypso/components/forms/form-select';

export const TimeDateChartPicker = () => {
	const translate = useTranslate();

	return (
		<FormFieldset>
			<FormLabel htmlFor="date_time_chart_picker">{ translate( 'Time range' ) }</FormLabel>
			<FormSelect name="date_time_chart_picker" id="date_time_chart_picker">
				<option value="0">
					{ translate( '6 hours', { context: 'Time range for site metrics' } ) }
				</option>
				<option value="1">
					{ translate( '24 hours', { context: 'Time range for site metrics' } ) }
				</option>
				<option value="1">
					{ translate( '3 days', { context: 'Time range for site metrics' } ) }
				</option>
				<option value="1">
					{ translate( '7 days', { context: 'Time range for site metrics' } ) }
				</option>
			</FormSelect>
		</FormFieldset>
	);
};
