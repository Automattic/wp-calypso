import { TextControl, Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
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

	const translate = useTranslate();

	return (
		<div className="date-control-picker-date">
			<div className="stats-date-control-picker-dates__inputs">
				<TextControl value={ startDate } onChange={ onStartChange } />
				<TextControl value={ endDate } onChange={ onEndChange } />
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
