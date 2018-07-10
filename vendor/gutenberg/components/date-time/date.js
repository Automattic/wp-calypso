/**
 * External dependencies
 */
import ReactDatePicker from 'react-datepicker';
import moment from 'moment';

/**
 * Module Constants
 */
const TIMEZONELESS_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

function DatePicker( { currentDate, onChange, ...args } ) {
	const momentDate = currentDate ? moment( currentDate ) : moment();
	const onChangeMoment = ( newDate ) => onChange( newDate.format( TIMEZONELESS_FORMAT ) );

	return <ReactDatePicker
		inline
		selected={ momentDate }
		onChange={ onChangeMoment }
		{ ...args }
	/>;
}

export default DatePicker;
