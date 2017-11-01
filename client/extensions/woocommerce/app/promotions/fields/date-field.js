/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import DatePicker from 'components/date-picker';
import FormField from './form-field';

const DateField = ( props ) => {
	const { fieldName, explanationText, value, edit } = props;
	const selectedDay = ( value ? new Date( value ) : new Date() );

	const onSelectDay = ( day ) => {
		edit( fieldName, day.toISOString() );
	};

	return (
		<FormField { ...props }>
			<DatePicker
				aria-describedby={ explanationText && fieldName + '-description' }
				initialMonth={ selectedDay }
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

export default DateField;

