/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DatePicker from 'components/date-picker';
import FormField from './form-field';

const DateField = ( props ) => {
	const { fieldName, explanationText, value, edit, moment } = props;
	const selectedDay = ( value ? new Date( value ) : new Date() );

	const onSelectDay = ( day ) => {
		edit( fieldName, moment( day ).format( 'YYYY-MM-DDTHH:mm:ss' ) );
	};

	return (
		<FormField { ...props }>
			<DatePicker
				aria-describedby={ explanationText && fieldName + '-description' }
				calendarViewDate={ selectedDay }
				selectedDay={ selectedDay }
				onSelectDay={ onSelectDay }
			/>
		</FormField>
	);
};

DateField.PropTypes = {
	fieldName: PropTypes.string.isRequired,
	explanationText: PropTypes.string,
	value: PropTypes.number,
	edit: PropTypes.func.isRequired,
};

export default localize( DateField );

