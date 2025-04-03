import { FormLabel } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useRef, useCallback } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { useLocalizedMoment } from 'calypso/components/localized-moment';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

type StartOrEnd = 'Start' | 'End';

interface Props {
	startDateValue: string;
	endDateValue: string;
	startLabel: string | null | undefined;
	endLabel: string | null | undefined;
	onInputFocus: ( value: string | null | undefined, startOrEnd: StartOrEnd ) => void;
	onInputBlur: ( value: string | null | undefined, startOrEnd: StartOrEnd ) => void;
	onInputChange: ( value: string | null | undefined, startOrEnd: StartOrEnd ) => void;
}

const DateRangeInputs: FunctionComponent< Props > = ( {
	onInputFocus = noop,
	onInputBlur = noop,
	onInputChange = noop,
	...props
} ) => {
	const uniqueIdRef = useRef( crypto.randomUUID() );
	const uniqueId = uniqueIdRef.current;
	const translate = useTranslate();

	const startDateID = `startDate-${ uniqueId }`;
	const endDateID = `endDate-${ uniqueId }`;

	/**
	 * Handles input focus events with fixed arguments
	 * for consistency via partial application
	 * @param  startOrEnd one of "Start" or "End"
	 * @returns the partially applied function ready to receive event data
	 */
	const handleInputFocus = useCallback(
		( startOrEnd: StartOrEnd ) => ( e: Event ) => {
			const { value } = e.target as HTMLInputElement;
			onInputFocus( value, startOrEnd );
		},
		[ onInputFocus ]
	);

	/**
	 * Handles input blur events with fixed arguments
	 * for consistency via partial application
	 * @param  startOrEnd one of "Start" or "End"
	 * @returns the partially applied function ready to receive event data
	 */
	const handleInputBlur = useCallback(
		( startOrEnd: StartOrEnd ) => ( e: Event ) => {
			const { value } = e.target as HTMLInputElement;
			onInputBlur( value, startOrEnd );
		},
		[ onInputBlur ]
	);

	/**
	 * Handles input change events with fixed arguments
	 * for consistency via partial application
	 * @param  startOrEnd one of "Start" or "End"
	 * @returns the partially applied function ready to receive event data
	 */
	const handleInputChange = useCallback(
		( startOrEnd: StartOrEnd ) => ( e: Event ) => {
			const { value } = e.target as HTMLInputElement;
			onInputChange( value, startOrEnd );
		},
		[ onInputChange ]
	);

	const moment = useLocalizedMoment();

	// => "MM/DD/YYYY" (or locale equivalent)
	const localeDateFormat = moment.localeData().longDateFormat( 'L' );

	// If we haven't received a actual date then don't show anything and utilise the placeholder
	// as it is supposed to be used
	const startValue = props.startDateValue !== localeDateFormat ? props.startDateValue : '';
	const endValue = props.endDateValue !== localeDateFormat ? props.endDateValue : '';

	return (
		<FormFieldset className="date-range__date-inputs">
			<legend className="date-range__date-inputs-legend">Start and End Dates</legend>
			<div className="date-range__date-inputs-inner">
				<div className="date-range__date-input date-range__date-input--from">
					<FormLabel htmlFor={ startDateID }>
						{ props.startLabel ||
							translate( 'From', {
								comment: 'DateRange text input label for the start of the date range',
							} ) }
					</FormLabel>
					<FormTextInput
						id={ startDateID }
						name={ startDateID }
						value={ startValue }
						onChange={ handleInputChange( 'Start' ) }
						onBlur={ handleInputBlur( 'Start' ) }
						onFocus={ handleInputFocus( 'Start' ) }
						placeholder={ localeDateFormat }
					/>
				</div>
				<div className="date-range__date-input date-range__date-input--to">
					<FormLabel htmlFor={ endDateID }>
						{ props.startLabel ||
							translate( 'To', {
								comment: 'DateRange text input label for the end of the date range',
							} ) }
					</FormLabel>
					<FormTextInput
						id={ endDateID }
						name={ endDateID }
						value={ endValue }
						onChange={ handleInputChange( 'End' ) }
						onBlur={ handleInputBlur( 'End' ) }
						onFocus={ handleInputFocus( 'End' ) }
						placeholder={ localeDateFormat }
					/>
				</div>
			</div>
		</FormFieldset>
	);
};

export default DateRangeInputs;
