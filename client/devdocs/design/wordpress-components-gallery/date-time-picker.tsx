/**
 * External dependencies
 */
import React, { useState } from 'react';

/**
 * WordPress dependencies
 */
import { DateTimePicker } from '@wordpress/components';

const DateTimePickerExample = () => {
	const [ dateTime, setDateTime ] = useState( '' );

	return <DateTimePicker currentDate={ dateTime } onChange={ setDateTime } />;
};

export default DateTimePickerExample;
