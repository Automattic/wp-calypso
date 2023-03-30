import { useLocalizedMoment } from 'calypso/components/localized-moment';
import type { Moment } from 'moment';

interface Props extends Omit< React.HTMLAttributes< HTMLInputElement >, 'value' | 'onChange' > {
	value: Moment;
	onChange: ( value: Moment ) => void;
}

// The datetime-local input expects this specific format
const INPUT_DATE_FORMAT = 'YYYY-MM-DDThh:mm:ss';

export function DateTimePicker( { value, onChange, ...rest }: Props ) {
	const moment = useLocalizedMoment();

	return (
		<input
			type="datetime-local"
			value={ value.format( INPUT_DATE_FORMAT ) }
			max={ moment().format( INPUT_DATE_FORMAT ) }
			step={ 1 } // support 1 second granularity
			onChange={ ( event ) => {
				onChange( moment( event.currentTarget.value, INPUT_DATE_FORMAT ) );
			} }
			{ ...rest }
		/>
	);
}
