import { DateTimePicker } from '@wordpress/components';
import { useState } from 'react';

const DateTimePickerExample = () => {
	const [ dateTime, setDateTime ] = useState( '' );

	return <DateTimePicker currentDate={ dateTime } onChange={ setDateTime } />;
};

export default DateTimePickerExample;
