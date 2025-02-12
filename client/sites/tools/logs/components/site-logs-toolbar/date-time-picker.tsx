import clsx from 'clsx';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import type { Moment } from 'moment';

interface Props
	extends Omit< React.HTMLAttributes< HTMLInputElement >, 'value' | 'onChange' | 'max' | 'min' > {
	value: Moment;
	max?: Moment;
	min?: Moment;

	// The value returned by onChange ignores the `gmtOffset` prop. It will be in the same
	// timezone as the time passed to the `value` prop. This makes round-tripping values through
	// the `<DateTimePicker>` easier.
	onChange: ( value: Moment ) => void;

	// datetime-local inputs don't understand timezones, but this prop will cause the component
	// to display values in this timezone.
	// gmtOffset is in hours.
	gmtOffset?: number;
}

// The datetime-local input expects this specific format
const INPUT_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

export function DateTimePicker( {
	className,
	value,
	onChange,
	gmtOffset = 0,
	max,
	min,
	...rest
}: Props ) {
	const moment = useLocalizedMoment();

	const onDateChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		const newDate = moment( event.currentTarget.value, INPUT_DATE_FORMAT )
			.utcOffset( gmtOffset * 60, true )
			.utcOffset( value.utcOffset() );
		onChange( newDate );
	};

	return (
		<input
			className={ clsx( 'button', className ) }
			type="datetime-local"
			value={ value
				.clone()
				.utcOffset( gmtOffset * 60 )
				.format( INPUT_DATE_FORMAT ) }
			{ ...( min && {
				min: min
					.clone()
					.utcOffset( gmtOffset * 60 )
					.format( INPUT_DATE_FORMAT ),
			} ) }
			{ ...( max && {
				max: max
					.clone()
					.utcOffset( gmtOffset * 60 )
					.format( INPUT_DATE_FORMAT ),
			} ) }
			step={ 1 } // support 1 second granularity
			onChange={ onDateChange }
			required
			{ ...rest }
		/>
	);
}
