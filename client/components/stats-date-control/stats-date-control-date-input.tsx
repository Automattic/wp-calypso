import moment from 'moment';
import React from 'react';

interface Props {
	id: string;
	value: string;
	onChange?: ( value: string ) => void;
	max?: string;
}

const DateInput: React.FC< Props > = ( {
	value,
	onChange,
	id,
	max = moment().format( 'YYYY-MM-DD' ),
} ) => {
	const handleChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		onChange && onChange( event.target.value );
	};

	return (
		<input
			id={ id }
			type="text"
			value={ value }
			onChange={ handleChange }
			placeholder="YYYY-MM-DD" // Guide users on the expected format
			pattern="\d{4}-\d{2}-\d{2}" // Use a pattern to enforce the format
			title="Date format: YYYY-MM-DD" // Provides a tooltip on hover to guide users
			max={ max }
		/>
	);

	// <input id={ id } type="date" value={ value } onChange={ handleChange } max={ max } />;
};

export default DateInput;
