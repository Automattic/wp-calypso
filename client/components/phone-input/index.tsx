import clsx from 'clsx';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState, useEffect } from 'react';
import FormCountrySelect from 'calypso/components/forms/form-country-select';
import FormTextInput from 'calypso/components/forms/form-text-input';
import CountryFlag from 'calypso/components/phone-input/country-flag';
import { countries } from 'calypso/components/phone-input/data';
import {
	formatNumber,
	toIcannFormat,
	findCountryFromNumber,
	processNumber,
	getUpdatedCursorPosition,
	MIN_LENGTH_TO_FORMAT,
} from 'calypso/components/phone-input/phone-number';
import type { CountryListItem } from '@automattic/wpcom-checkout';
import type { FC, MutableRefObject, ChangeEvent } from 'react';

import './style.scss';

const debug = debugFactory( 'calypso:phone-input' );

export type PhoneInputValue = {
	phoneNumber: string;
	countryCode: string;
};

export type RefFunction = ( ref: HTMLInputElement | undefined ) => void;

export type PhoneInputProps = {
	className?: string;
	countriesList: CountryListItem[];
	disabled?: boolean;
	enableStickyCountry?: boolean;
	inputRef?: MutableRefObject< HTMLInputElement | undefined > | RefFunction;
	isError?: boolean;
	name?: string;
	onChange: ( newValueAndCountry: PhoneInputValue ) => void;
	value: PhoneInputValue;
};

type PhoneNumberInputState = {
	rawValue: string;
	displayValue: string;
};

type SetPhoneNumberInputState = React.Dispatch< React.SetStateAction< PhoneNumberInputState > >;

const PhoneInput: FC< PhoneInputProps > = ( {
	className,
	countriesList,
	disabled,
	enableStickyCountry = true,
	inputRef,
	isError,
	name,
	onChange,
	value,
} ) => {
	const translate = useTranslate();
	const [ freezeSelection, setFreezeSelection ] = useState( enableStickyCountry );
	const [ phoneNumberState, setPhoneNumberState ] = usePhoneNumberState(
		value.phoneNumber,
		value.countryCode,
		countriesList,
		freezeSelection
	);

	const { displayValue } = phoneNumberState;

	const numberInputRef = useSharedRef( inputRef );
	const oldCursorPosition = useRef< number[] >( [] );

	useAdjustCursorPosition( displayValue, value.countryCode, numberInputRef, oldCursorPosition );

	const handleInput = getInputHandler(
		setPhoneNumberState,
		onChange,
		value.countryCode,
		freezeSelection,
		oldCursorPosition
	);
	const handleCursorMove = ( event: ChangeEvent< HTMLInputElement > ) => {
		recordCursorPosition( oldCursorPosition, event.target.selectionStart );
	};
	const handleCountrySelection = getCountrySelectionHandler(
		displayValue,
		value.countryCode,
		onChange,
		setFreezeSelection,
		enableStickyCountry
	);

	return (
		<div className={ clsx( className, 'phone-input' ) }>
			<FormTextInput
				placeholder={ translate( 'Phone' ) }
				onChange={ handleInput }
				onClick={ handleCursorMove }
				onKeyUp={ handleCursorMove }
				name={ name }
				value={ displayValue }
				inputRef={ numberInputRef }
				type="tel"
				disabled={ disabled }
				className={ clsx( 'phone-input__number-input', {
					'is-error': isError,
				} ) }
			/>
			<div className="phone-input__select-container">
				<div className="phone-input__select-inner-container">
					<FormCountrySelect
						tabIndex={ -1 }
						className="phone-input__country-select"
						onChange={ handleCountrySelection }
						value={ getCountry( value.countryCode ).isoCode }
						countriesList={ countriesList }
						disabled={ disabled }
					/>
					<CountryFlag countryCode={ getCountry( value.countryCode ).isoCode.toLowerCase() } />
				</div>
			</div>
		</div>
	);
};

function useAdjustCursorPosition(
	displayValue: string,
	countryCode: string,
	numberInputRef: MutableRefObject< HTMLInputElement | undefined >,
	cursorPositionRef: MutableRefObject< number[] >
) {
	const oldValue = useRef( displayValue );
	const oldCountry = useRef( countryCode );
	useEffect( () => {
		const oldCursorPosition = getLastCursorPosition( cursorPositionRef.current );
		if ( ! numberInputRef.current ) {
			return;
		}
		if ( displayValue === oldValue.current && countryCode === oldCountry.current ) {
			return;
		}

		const newCursorPosition = getUpdatedCursorPosition(
			oldValue.current,
			displayValue,
			oldCursorPosition
		);

		oldValue.current = displayValue;
		oldCountry.current = countryCode;

		debug( 'moving cursor from', oldCursorPosition, 'to', newCursorPosition );
		cursorPositionRef.current?.push( newCursorPosition );
		numberInputRef.current.setSelectionRange( newCursorPosition, newCursorPosition );
	}, [ displayValue, numberInputRef, countryCode, cursorPositionRef ] );
}

function getLastCursorPosition( recentPositions: number[] ) {
	const length = recentPositions.length;
	let index = length - 1;
	if ( length === 0 ) {
		return 0;
	} else if ( length >= 2 ) {
		index = length - 2;
	} else if ( length >= 1 ) {
		index = length - 1;
	}
	return recentPositions[ index ];
}

function useSharedRef(
	inputRef: MutableRefObject< HTMLInputElement | undefined > | RefFunction | undefined
) {
	const numberInputRef = useRef< HTMLInputElement | undefined >();
	useEffect( () => {
		if ( ! inputRef ) {
			return;
		}
		if ( typeof inputRef === 'function' ) {
			inputRef( numberInputRef.current );
		} else {
			inputRef.current = numberInputRef.current;
		}
	}, [ inputRef ] );
	return numberInputRef;
}

function usePhoneNumberState(
	value: string,
	countryCode: string,
	countriesList: CountryListItem[],
	freezeSelection: boolean
): [ PhoneNumberInputState, SetPhoneNumberInputState ] {
	const previousValue = useRef( value );
	const previousCountry = useRef( countryCode );
	const [ phoneNumberState, setPhoneNumberState ] = useState( () =>
		getPhoneNumberStatesFromProp( value, countryCode, freezeSelection )
	);
	const { rawValue, displayValue } = phoneNumberState;

	useEffect( () => {
		// No need to update if the value has not changed
		if ( previousValue.current === value && previousCountry.current === countryCode ) {
			debug( 'props change did not change value or country' );
			return;
		}
		// No need to update if the prop value is equal to one form of the current value
		const icannValue = toIcannFormat(
			displayValue,
			countries[ countryCode as keyof typeof countries ]
		);
		if (
			previousCountry.current === countryCode &&
			( value === rawValue || value === displayValue || value === icannValue )
		) {
			debug( 'props change did not change normalized value', value );
			return;
		}
		previousValue.current = value;
		previousCountry.current = countryCode;
		const newState = getPhoneNumberStatesFromProp( value, countryCode, freezeSelection );
		debug( 'props changed, updating value; ', {
			rawValue,
			displayValue,
			icannValue,
			value,
			countryCode,
			oldCountry: previousCountry.current,
			newState,
		} );
		setPhoneNumberState( newState );
	}, [ rawValue, displayValue, value, countryCode, countriesList, freezeSelection ] );

	return [ phoneNumberState, setPhoneNumberState ];
}

function getPhoneNumberStatesFromProp(
	rawValue: string,
	countryCode: string,
	freezeSelection: boolean
) {
	const { phoneNumber: displayValue } = calculateInputAndCountryCode(
		rawValue,
		countryCode,
		freezeSelection
	);
	return { rawValue, displayValue };
}

function getInputHandler(
	setPhoneNumberState: SetPhoneNumberInputState,
	onChange: ( newValueAndCountry: PhoneInputValue ) => void,
	countryCodeValue: string,
	freezeSelection: boolean,
	oldCursorPosition: MutableRefObject< number[] >
) {
	return function handleInput( event: ChangeEvent< HTMLInputElement > ) {
		event.preventDefault();
		const rawValue = event.target.value;
		recordCursorPosition( oldCursorPosition, event.target.selectionStart );

		const { countryCode, phoneNumber: displayValue } = calculateInputAndCountryCode(
			rawValue,
			countryCodeValue,
			freezeSelection
		);

		setPhoneNumberState( ( oldValue ) => {
			debug( 'changing value from', oldValue.displayValue, 'to', displayValue );
			return { rawValue, displayValue };
		} );

		onChange( { phoneNumber: displayValue, countryCode } );
	};
}

function recordCursorPosition(
	oldCursorPosition: MutableRefObject< number[] >,
	newPosition: number | null
) {
	if ( ! newPosition ) {
		return;
	}
	oldCursorPosition.current.push( newPosition );
	oldCursorPosition.current = oldCursorPosition.current.slice( -3 );
	debug( 'updating oldCursorPosition to', oldCursorPosition.current );
}

function calculateInputAndCountryCode(
	value: string,
	countryCode: string,
	freezeSelection: boolean
): PhoneInputValue {
	const calculatedCountry = guessCountryFromValueOrGetSelected(
		value,
		countryCode,
		freezeSelection
	);
	const calculatedValue = format( value, calculatedCountry.isoCode );
	const calculatedCountryCode = calculatedCountry.isoCode;

	return { phoneNumber: calculatedValue, countryCode: calculatedCountryCode };
}

/**
 * Decides whether to guess the country from the input value
 * @param {string} value - The phone number
 * @param {string} countryCode - The country code
 * @param {boolean} freezeSelection - True if we should never guess
 * @returns {boolean} - Whether to guess the country or not
 */
function shouldGuessCountry(
	value: string,
	countryCode: string,
	freezeSelection: boolean
): boolean {
	if ( ! value || value.length < MIN_LENGTH_TO_FORMAT || freezeSelection ) {
		return false;
	}
	const countryData = getCountry( countryCode );
	const dialCode =
		'countryDialCode' in countryData ? countryData.countryDialCode : countryData.dialCode;
	return value[ 0 ] === '+' || ( value[ 0 ] === '1' && dialCode === '1' );
}

/**
 * Returns the selected country from dropdown or guesses the country from input
 * @param {string} value - Input number
 * @param {string} fallbackCountryCode - Fallback country code in case we can't find a match
 * @param {boolean} freezeSelection - True if we should never guess the country
 */
function guessCountryFromValueOrGetSelected(
	value: string,
	fallbackCountryCode: string,
	freezeSelection: boolean
) {
	if ( shouldGuessCountry( value, fallbackCountryCode, freezeSelection ) ) {
		return findCountryFromNumber( value, fallbackCountryCode ) || getCountry( 'world' );
	}

	return getCountry( fallbackCountryCode );
}

/**
 * Format the phone number for display
 * @param {string} value - The phone number value to format
 * @param {string} countryCode - The country code to use for the format
 * @returns {string} The formatted number
 */
function format( value: string, countryCode: string ): string {
	return formatNumber( value, getCountry( countryCode ) );
}

/**
 * Returns the country meta with default values for countries with missing metadata. Never returns null.
 */
function getCountry( countryCode: string ) {
	let selectedCountry = countries[ countryCode as keyof typeof countries ];

	if ( ! selectedCountry ) {
		selectedCountry = {
			isoCode: countryCode,
			dialCode: '',
			nationalPrefix: '',
		};
	}
	return selectedCountry;
}

function getCountrySelectionHandler(
	value: string,
	countryCode: string,
	onChange: ( newValueAndCountry: PhoneInputValue ) => void,
	setFreezeSelection: ( shouldFreeze: boolean ) => void,
	enableStickyCountry: boolean
) {
	return function handleCountrySelection( event: ChangeEvent< HTMLSelectElement > ) {
		const newCountryCode = event.target.value;
		if ( newCountryCode === countryCode ) {
			return;
		}
		let inputValue = value;
		/*
		 If using national format we need to extract the national number and format it instead of the direct value
		 This is because not all countries have the same national prefix
		 E.g. UK's national prefix is 0 and Turkmenistan's national prefix is 8.
		 Given number 0555 666 77 88 for UK should match to 8555 666 77 88 for Turkmenistan. However, if we change
		 the country from UK to Turkmenistan with 05556667788, it will not recognize UK's national prefix of 0 and add
		 its own prefix 8, resulting in 805556667788, and if you switch back, UK will not recognize Turkmenistan's
		 national prefix 8 and add its own prefix 0, resulting in 0805556667788. However, when we process it here and
		 format the national number, UK -> Turkmenistan will be like 05556667788 -> 85556667788, which is the expected
		 result.
		 */
		const { nationalNumber } = processNumber( value, getCountry( countryCode ) );
		if ( value[ 0 ] !== '+' ) {
			inputValue = nationalNumber;
		} else {
			inputValue = '+' + getCountry( newCountryCode ).dialCode + nationalNumber;
		}
		onChange( {
			countryCode: newCountryCode,
			phoneNumber: format( inputValue, newCountryCode ),
		} );
		debug( 'setting freeze to', enableStickyCountry );
		setFreezeSelection( enableStickyCountry );
	};
}

export default PhoneInput;
