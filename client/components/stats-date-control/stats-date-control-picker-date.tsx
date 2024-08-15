import config from '@automattic/calypso-config';
import { Button, DatePicker } from '@wordpress/components';
import { Icon, lock } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
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

	const handleStartSeletion = ( date: string ) => {
		onStartChange( date.split( 'T' )?.[ 0 ] );
	};

	const handleEndSeletion = ( date: string ) => {
		onEndChange( date.split( 'T' )?.[ 0 ] );
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
					<DateInput id="startDate" value={ startDate } onChange={ onStartChange } />
				</div>
				<div className={ `${ BASE_CLASS_NAME }s__inputs-input-group` }>
					<label htmlFor="endDate">{ translate( 'To', { context: 'to date' } ) }</label>
					<DateInput id="endDate" value={ endDate } onChange={ onEndChange } />
				</div>
			</div>
			{ isCalendarEnabled && (
				<div className={ `${ BASE_CLASS_NAME }s__calendar` }>
					<DatePicker currentDate={ startDate } onChange={ handleStartSeletion } />
					<DatePicker currentDate={ endDate } onChange={ handleEndSeletion } />
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
