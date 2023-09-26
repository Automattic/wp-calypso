import { TextControl, Button } from '@wordpress/components';
import React from 'react';
import { DateControlPickerDateProps } from './types';

const DateControlPickerDate = ( {
	startDate = '',
	endDate = '',
	onStartChange,
	onEndChange,
	onApply,
}: DateControlPickerDateProps ) => {
	return (
		<>
			<div>
				<TextControl value={ startDate } onChange={ onStartChange } />
			</div>
			<div>
				<TextControl value={ endDate } onChange={ onEndChange } />
			</div>
			<Button variant="primary" onClick={ onApply }>
				Apply
			</Button>
		</>
	);
};

export default DateControlPickerDate;
