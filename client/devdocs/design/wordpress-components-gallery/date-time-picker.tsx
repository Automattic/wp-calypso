/**
 * External dependencies
 */
import React, { useState } from 'react';

/**
 * WordPress dependencies
 */
import { DateTimePicker } from '@wordpress/components';

const Example = () => {
	const [ dateTime, setDateTime ] = useState( '' );

	return <DateTimePicker currentDate={ dateTime } onChange={ setDateTime } />;
};

export default Example;
