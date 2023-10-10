import { TextControl, Button } from '@wordpress/components';
import React from 'react';
import { DateControlPickerDateProps } from './types';

const DateControlPickerDate = ( {
	startDate = '',
	endDate = '',
	onStartChange,
	onEndChange,
	onApply,
	onCancel,
}: DateControlPickerDateProps ) => {
	// TODO: Rename component?
	// Feels a bit confusing now. Should have a better idea
	// of appropriate names once hierarchy is finalized.
	return (
		<div className="date-control-picker-date">
			<div>
				<TextControl value={ startDate } onChange={ onStartChange } />
			</div>
			<div>
				<TextControl value={ endDate } onChange={ onEndChange } />
			</div>
			<Button onClick={ onCancel }>Cancel</Button>
			<Button variant="primary" onClick={ onApply }>
				Apply
			</Button>
		</div>
	);
};

export default DateControlPickerDate;
