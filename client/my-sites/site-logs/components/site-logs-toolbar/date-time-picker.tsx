import { useLocalizedMoment } from 'calypso/components/localized-moment';
import type { Moment } from 'moment';

interface Props
	extends Omit< React.HTMLAttributes< HTMLInputElement >, 'value' | 'onChange' | 'max' | 'min' > {
	value: Moment;
	max?: Moment;
	min?: Moment;
	onChange: ( value: Moment ) => void;

	// datetime-local inputs don't understand timezones, but this prop will cause the component
	// to display values, and return values with onChange, in this timezone.
	// gmtOffset is in hours.
	gmtOffset?: number;
}

// The datetime-local input expects this specific format
const INPUT_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

export function DateTimePicker( { value, onChange, gmtOffset = 0, max, min, ...rest }: Props ) {
	const moment = useLocalizedMoment();

	return (
		<input
			type="datetime-local"
			value={ value.utcOffset( gmtOffset * 60 ).format( INPUT_DATE_FORMAT ) }
			{ ...( min && {
				min: min.utcOffset( gmtOffset * 60 ).format( INPUT_DATE_FORMAT ),
			} ) }
			{ ...( max && {
				max: max.utcOffset( gmtOffset * 60 ).format( INPUT_DATE_FORMAT ),
			} ) }
			step={ 1 } // support 1 second granularity
			onChange={ ( event ) => {
				onChange(
					moment( event.currentTarget.value, INPUT_DATE_FORMAT ).utcOffset( gmtOffset * 60, true )
				);
			} }
			{ ...rest }
		/>
	);
}
