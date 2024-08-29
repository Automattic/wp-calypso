import moment from 'moment';

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
		onChange && onChange( event?.target?.value );
	};

	return <input id={ id } type="date" value={ value } onChange={ handleChange } max={ max } />;
};

export default DateInput;
