import config from '@automattic/calypso-config';
import moment from 'moment';
import React from 'react';

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
	const handleChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		onChange && onChange( event.target.value );
	};

	const toDateString = ( date: moment.MomentInput ) => {
		if ( moment.isMoment( date ) || moment( date ).isValid() ) {
			return moment( date ).format( 'YYYY-MM-DD' );
		}
		return moment().format( 'YYYY-MM-DD' );
	};

	const handleBlur = () => {
		if ( isNewCalendar ) {
			const isValid = moment( value, 'YYYY-MM-DD', true ).isValid();
			if ( ! isValid ) {
				onChange && onChange( moment().format( 'YYYY-MM-DD' ) );
			} else {
				toDateString( value );
			}
		}
	};

	return (
		<>
			{ isNewCalendar ? (
				<input
					id={ id }
					type="text"
					value={ value }
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
