import config from '@automattic/calypso-config';
import { Button, DatePicker } from '@wordpress/components';
import { Icon, lock } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import DateInput from './stats-date-control-date-input';
import { DateControlPickerDateProps } from './types';

const BASE_CLASS_NAME = 'stats-date-control-picker-date';
const isCalendarEnabled = config.isEnabled( 'stats/date-picker-calendar' );

const DateControlPickerDate = ( {
	startDate = '',
	endDate = '',
	onStartChange,
	onEndChange,
	onApply,
	onCancel,
	overlay,
}: DateControlPickerDateProps ) => {
	const translate = useTranslate();

	const [ previewDateStart, setPreviewDateStart ] = useState( startDate );
	const [ previewDateEnd, setPreviewDateEnd ] = useState( endDate );

	// Updates the selected date in the input field and the calendar after clicking on a date
	const handleStartSeletion = ( date: string ) => {
		onStartChange( date.split( 'T' )?.[ 0 ] );
		setPreviewDateStart( date.split( 'T' )?.[ 0 ] );
	};

	const handleEndSeletion = ( date: string ) => {
		onEndChange( date.split( 'T' )?.[ 0 ] );
		setPreviewDateEnd( date.split( 'T' )?.[ 0 ] );
	};

	// Updates only the visible month in the calendar
	const handleStartMonthTogglePrevious = ( date: string ) => {
		setPreviewDateEnd( previewDateStart );
		setPreviewDateStart( date );
	};

	const handleEndMonthToggleNext = ( date: string ) => {
		setPreviewDateStart( previewDateEnd );
		setPreviewDateEnd( date );
	};

	return (
		<div
			className={ clsx( BASE_CLASS_NAME, {
				[ `${ BASE_CLASS_NAME }__hasoverlay` ]: !! overlay,
			} ) }
		>
			<h2 className={ `${ BASE_CLASS_NAME }__heading` }>
				{ overlay && <Icon icon={ lock } /> }
				<div className={ `${ BASE_CLASS_NAME }s__heading-text` }>
					{ translate( 'Date Range' ) }
					<span> &#8212;</span>
					<input id="date-example" type="date" disabled />
				</div>
			</h2>
			<div className={ `${ BASE_CLASS_NAME }s__inputs` }>
				<div className={ `${ BASE_CLASS_NAME }s__inputs-input-group` }>
					<label htmlFor="startDate">{ translate( 'From', { context: 'from date' } ) }</label>
					<DateInput id="startDate" value={ startDate } onChange={ handleStartSeletion } />
				</div>
				<div className={ `${ BASE_CLASS_NAME }s__inputs-input-group` }>
					<label htmlFor="endDate">{ translate( 'To', { context: 'to date' } ) }</label>
					<DateInput id="endDate" value={ endDate } onChange={ handleEndSeletion } />
				</div>
			</div>
			{ isCalendarEnabled && (
				<div className={ `${ BASE_CLASS_NAME }s__calendar` }>
					<div className={ `${ BASE_CLASS_NAME }s__calendar--from` }>
						<DatePicker
							currentDate={ previewDateStart || startDate }
							onChange={ handleStartSeletion }
							onMonthPreviewed={ handleStartMonthTogglePrevious }
						/>
					</div>
					<div className={ `${ BASE_CLASS_NAME }s__calendar--to` }>
						<DatePicker
							currentDate={ previewDateEnd || endDate }
							onChange={ handleEndSeletion }
							onMonthPreviewed={ handleEndMonthToggleNext }
						/>
					</div>
				</div>
			) }
			<div className={ `${ BASE_CLASS_NAME }s__buttons` }>
				<Button onClick={ onCancel }>{ translate( 'Cancel' ) }</Button>
				<Button variant="primary" onClick={ onApply }>
					{ translate( 'Apply' ) }
				</Button>
			</div>
			{ overlay && <div className={ `${ BASE_CLASS_NAME }__overlay` }>{ overlay }</div> }
		</div>
	);
};

export default DateControlPickerDate;
