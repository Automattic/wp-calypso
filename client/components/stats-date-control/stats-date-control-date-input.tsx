import config from '@automattic/calypso-config';
import moment from 'moment';
import React, { useEffect, useState } from 'react';

interface Props {
	id: string;
	value: string;
	onChange?: ( value: string ) => void;
	max?: string;
}

const isNewCalendar = config.isEnabled( 'stats/date-picker-calendar' );

const DateInput: React.FC< Props > = ( {
	value,
	onChange,
	id,
	max = moment().format( 'YYYY-MM-DD' ),
} ) => {
	const [ inputValue, setInputValue ] = useState( value );

	useEffect( () => {
		setInputValue( value );
	}, [ value ] );

	const handleChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		// track value internally
		setInputValue( event?.target?.value );
	};

	const handleBlur = ( event: React.FocusEvent< HTMLInputElement > ) => {
		const value = event?.target?.value;

		if ( isNewCalendar ) {
			const isValid = moment( value, 'YYYY-MM-DD', true ).isValid();

			if ( ! isValid ) {
				setInputValue( moment().format( 'YYYY-MM-DD' ) );
			} else {
				onChange?.( value );
			}
		}
	};

	return (
		<>
			{ isNewCalendar ? (
				<input
					id={ id }
					className="stats-date-control-picker-dates__input"
					type="text"
					value={ inputValue }
					onChange={ handleChange }
					onBlur={ handleBlur } // Add onBlur event for validation
					placeholder="YYYY-MM-DD" // Placeholder text in input field
					title="Date format: YYYY-MM-DD" // tooltip for format
					max={ max }
				/>
			) : (
				<input id={ id } type="date" value={ value } onChange={ handleChange } max={ max } /> // original date type input pre-feature flag
			) }
		</>
	);
};

export default DateInput;
