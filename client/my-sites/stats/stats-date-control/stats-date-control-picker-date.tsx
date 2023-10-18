import { TextControl, Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { DateControlPickerDateProps } from './types';

const DateControlPickerDate = ( {
	startDate = '',
	endDate = '',
	onStartChange,
	onEndChange,
	onApply,
	onCancel,
}: DateControlPickerDateProps ) => {
	const translate = useTranslate();

	return (
		<div className="date-control-picker-date">
			<h2 className="date-control-picker-date__heading">
				{ translate( 'Date Range' ) }
				<span> (dd/mm/yyyy)</span>
			</h2>
			<div className="stats-date-control-picker-dates__inputs">
				<div className="stats-date-control-picker-dates__inputs-input-group">
					<label htmlFor="startDate">From</label>
					<TextControl id="startDate" value={ startDate } onChange={ onStartChange } />
				</div>
				<div className="stats-date-control-picker-dates__inputs-input-group">
					<label htmlFor="endDate">To</label>
					<TextControl id="endDate" value={ endDate } onChange={ onEndChange } />
				</div>
			</div>
			<div className="stats-date-control-picker-dates__buttons">
				<Button onClick={ onCancel }>{ translate( 'Cancel' ) }</Button>
				<Button variant="primary" onClick={ onApply }>
					{ translate( 'Apply' ) }
				</Button>
			</div>
		</div>
	);
};

export default DateControlPickerDate;
