import { Button } from '@wordpress/components';
import { Icon, lock } from '@wordpress/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import DateInput from './stats-date-control-date-input';
import { DateControlPickerDateProps } from './types';

const BASE_CLASS_NAME = 'stats-date-control-picker-date';

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

	return (
		<div
			className={ classNames( BASE_CLASS_NAME, {
				[ `${ BASE_CLASS_NAME }__hasoverlay` ]: !! overlay,
			} ) }
		>
			<h2 className={ `${ BASE_CLASS_NAME }__heading` }>
				{ translate( 'Date Range' ) }
				{ overlay && <Icon icon={ lock } /> }
				<span> &#8212;</span>
				<input id="date-example" type="date" disabled />
			</h2>
			<div className={ `${ BASE_CLASS_NAME }s__inputs` }>
				<div className={ `${ BASE_CLASS_NAME }s__inputs-input-group` }>
					<label htmlFor="startDate">From</label>
					<DateInput id="startDate" value={ startDate } onChange={ onStartChange } />
				</div>
				<div className={ `${ BASE_CLASS_NAME }s__inputs-input-group` }>
					<label htmlFor="endDate">To</label>
					<DateInput id="endDate" value={ endDate } onChange={ onEndChange } />
				</div>
			</div>
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
