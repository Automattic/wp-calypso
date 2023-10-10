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
	// Handle Cancel button.
	// Should call back to parent to handle closing of popover.
	const onCancel = () => {
		console.log( 'cancel button clicked' );
	};
	return (
		<>
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
		</>
	);
};

export default DateControlPickerDate;
