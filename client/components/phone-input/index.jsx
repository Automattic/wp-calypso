/**
 * External dependencies
 */
import React, { useRef, useState, useEffect } from 'react';
import { find } from 'lodash';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import FormCountrySelect from 'calypso/components/forms/form-country-select';
import FormTextInput from 'calypso/components/forms/form-text-input';
import {
	formatNumber,
	toIcannFormat,
	findCountryFromNumber,
	processNumber,
	getUpdatedCursorPosition,
	MIN_LENGTH_TO_FORMAT,
} from 'calypso/components/phone-input/phone-number';
import CountryFlag from 'calypso/components/phone-input/country-flag';
import { countries } from 'calypso/components/phone-input/data';

/**
 * Style dependencies
 */
import './style.scss';

const debug = debugFactory( 'calypso:phone-input' );

function PhoneInput( {
	translate,
	inputRef,
	onChange,
	className,
	isError,
	disabled,
	name,
	value,
	countryCode,
	countriesList,
	enableStickyCountry = true,
} ) {
	const [ freezeSelection, setFreezeSelection ] = useState( enableStickyCountry );
	const [ phoneNumberState, setPhoneNumberState ] = usePhoneNumberState(
		value,
		countryCode,
		countriesList,
		freezeSelection
	);

	const { displayValue } = phoneNumberState;

	const numberInputRef = useSharedRef( inputRef );
	const oldCursorPosition = useRef( [] );

	useAdjustCursorPosition( displayValue, countryCode, numberInputRef, oldCursorPosition );

	const handleInput = getInputHandler(
		setPhoneNumberState,
		onChange,
		countryCode,
		countriesList,
		freezeSelection,
		oldCursorPosition
	);
	const handleCursorMove = ( event ) => {
		recordCursorPosition( oldCursorPosition, event.target.selectionStart );
	};
	const handleCountrySelection = getCountrySelectionHandler(
		displayValue,
		countryCode,
		countriesList,
		onChange,
		setFreezeSelection,
		enableStickyCountry
	);

	return (
		<div className={ classnames( className, 'phone-input' ) }>
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
				className={ classnames( 'phone-input__number-input', {
					'is-error': isError,
				} ) }
			/>
			<div className="phone-input__select-container">
				<div className="phone-input__select-inner-container">
					<FormCountrySelect
						tabIndex={ -1 }
						className="phone-input__country-select"
						onChange={ handleCountrySelection }
						value={ getCountry( countryCode, countriesList ).isoCode }
						countriesList={ countriesList }
						disabled={ disabled }
					/>
					<CountryFlag
						countryCode={ getCountry( countryCode, countriesList ).isoCode.toLowerCase() }
					/>
				</div>
			</div>
		</div>
	);
}

PhoneInput.propTypes = {
	translate: PropTypes.func.isRequired,
	inputRef: PropTypes.oneOfType( [ PropTypes.func, PropTypes.object ] ),
	onChange: PropTypes.func.isRequired,
	className: PropTypes.string,
	isError: PropTypes.bool,
	disabled: PropTypes.bool,
	name: PropTypes.string,
	value: PropTypes.string.isRequired,
	countryCode: PropTypes.string.isRequired,
	countriesList: PropTypes.array.isRequired,
	enableStickyCountry: PropTypes.bool,
};

function useAdjustCursorPosition( displayValue, countryCode, numberInputRef, cursorPositionRef ) {
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
		cursorPositionRef.current.push( newCursorPosition );
		numberInputRef.current.setSelectionRange( newCursorPosition, newCursorPosition );
	}, [ displayValue, numberInputRef, countryCode, cursorPositionRef ] );
}

function getLastCursorPosition( recentPositions ) {
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

function useSharedRef( inputRef ) {
	const numberInputRef = useRef();
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

function usePhoneNumberState( value, countryCode, countriesList, freezeSelection ) {
	const previousValue = useRef( value );
	const previousCountry = useRef( countryCode );
	const [ phoneNumberState, setPhoneNumberState ] = useState( () =>
		getPhoneNumberStatesFromProp( value, countryCode, countriesList, freezeSelection )
	);
	const { rawValue, displayValue } = phoneNumberState;

	useEffect( () => {
		// No need to update if the value has not changed
		if ( previousValue.current === value && previousCountry.current === countryCode ) {
			debug( 'props change did not change value or country' );
			return;
		}
		// No need to update if the prop value is equal to one form of the current value
		const icannValue = toIcannFormat( displayValue, countries[ countryCode ] );
		if (
			previousCountry.current === countryCode &&
			( value === rawValue || value === displayValue || value === icannValue )
		) {
			debug( 'props change did not change normalized value', value );
			return;
		}
		previousValue.current = value;
		previousCountry.current = countryCode;
		const newState = getPhoneNumberStatesFromProp(
			value,
			countryCode,
			countriesList,
			freezeSelection
		);
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

function getPhoneNumberStatesFromProp( rawValue, countryCode, countriesList, freezeSelection ) {
	const { value: displayValue } = calculateInputAndCountryCode(
		rawValue,
		countryCode,
		countriesList,
		freezeSelection
	);
	return { rawValue, displayValue };
}

function getInputHandler(
	setPhoneNumberState,
	onChange,
	countryCodeValue,
	countriesList,
	freezeSelection,
	oldCursorPosition
) {
	return function handleInput( event ) {
		event.preventDefault();
		const rawValue = event.target.value;
		recordCursorPosition( oldCursorPosition, event.target.selectionStart );

		const { countryCode, value: displayValue } = calculateInputAndCountryCode(
			rawValue,
			countryCodeValue,
			countriesList,
			freezeSelection
		);

		setPhoneNumberState( ( oldValue ) => {
			debug( 'changing value from', oldValue.displayValue, 'to', displayValue );
			return { rawValue, displayValue };
		} );

		onChange( { value: displayValue, countryCode } );
	};
}

function recordCursorPosition( oldCursorPosition, newPosition ) {
	oldCursorPosition.current.push( newPosition );
	oldCursorPosition.current = oldCursorPosition.current.slice( -3 );
	debug( 'updating oldCursorPosition to', oldCursorPosition.current );
}

/**
 * Calculates the input and country
 *
 * @param {string} value - Phone number
 * @param {string} countryCode - The country code
 * @param {Array} countriesList - The list of countries
 * @param {boolean} freezeSelection - True if we should never guess the country
 * @returns {{value: string, countryCode: string}} - Result
 */
function calculateInputAndCountryCode( value, countryCode, countriesList, freezeSelection ) {
	const calculatedCountry = guessCountryFromValueOrGetSelected(
		value,
		countryCode,
		countriesList,
		freezeSelection
	);
	const calculatedValue = format( value, calculatedCountry.isoCode, countriesList );
	const calculatedCountryCode = calculatedCountry.isoCode;

	return { value: calculatedValue, countryCode: calculatedCountryCode };
}

/**
 * Decides whether to guess the country from the input value
 *
 * @param {string} value - The phone number
 * @param {string} countryCode - The country code
 * @param {Array} countriesList - The list of countries
 * @param {boolean} freezeSelection - True if we should never guess
 * @returns {boolean} - Whether to guess the country or not
 */
function shouldGuessCountry( value, countryCode, countriesList, freezeSelection ) {
	if ( ! value || value.length < MIN_LENGTH_TO_FORMAT || freezeSelection ) {
		return false;
	}
	const dialCode =
		getCountry( countryCode, countriesList ).countryDialCode ||
		getCountry( countryCode, countriesList ).dialCode;
	return value[ 0 ] === '+' || ( value[ 0 ] === '1' && dialCode === '1' );
}

/**
 * Returns the selected country from dropdown or guesses the country from input
 *
 * @param {string} value - Input number
 * @param {string} fallbackCountryCode - Fallback country code in case we can't find a match
 * @param {Array} countriesList - The list of countries
 * @param {boolean} freezeSelection - True if we should never guess the country
 * @returns {{isoCode: string, dialCode: string, nationalPrefix: string}} - Country metadata
 */
function guessCountryFromValueOrGetSelected(
	value,
	fallbackCountryCode,
	countriesList,
	freezeSelection
) {
	if ( shouldGuessCountry( value, fallbackCountryCode, countriesList, freezeSelection ) ) {
		return findCountryFromNumber( value ) || getCountry( 'world', countriesList );
	}

	return getCountry( fallbackCountryCode, countriesList );
}

/**
 * Format the phone number for display
 *
 * @param {string} value - The phone number value to format
 * @param {string} countryCode - The country code to use for the format
 * @param {Array} countriesList - The country data
 * @returns {string} The formatted number
 */
function format( value, countryCode, countriesList ) {
	return formatNumber( value, getCountry( countryCode, countriesList ) );
}

/**
 * Returns the country meta with default values for countries with missing metadata. Never returns null.
 *
 * @param {string} countryCode - The country code
 * @param {Array} countriesList - The country data
 * @returns {{isoCode: string, dialCode: string, nationalPrefix: string}} - Country metadata
 */
function getCountry( countryCode, countriesList ) {
	let selectedCountry = countries[ countryCode ];

	if ( ! selectedCountry ) {
		// Special cases where the country is in a disputed region and not globally recognized.
		// At this point this should only be used for: Canary islands, Kosovo, Netherlands Antilles
		const data = find( countriesList || [], ( { code } ) => code === countryCode );

		selectedCountry = {
			isoCode: countryCode,
			dialCode: ( ( data && data.numeric_code ) || '' ).replace( '+', '' ),
			nationalPrefix: '',
		};
	}
	return selectedCountry;
}

function getCountrySelectionHandler(
	value,
	countryCode,
	countriesList,
	onChange,
	setFreezeSelection,
	enableStickyCountry
) {
	return function handleCountrySelection( event ) {
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
		const { nationalNumber } = processNumber( value, getCountry( countryCode, countriesList ) );
		if ( value[ 0 ] !== '+' ) {
			inputValue = nationalNumber;
		} else {
			inputValue = '+' + getCountry( newCountryCode, countriesList ).dialCode + nationalNumber;
		}
		onChange( {
			countryCode: newCountryCode,
			value: format( inputValue, newCountryCode, countriesList ),
		} );
		debug( 'setting freeze to', enableStickyCountry );
		setFreezeSelection( enableStickyCountry );
	};
}

export default localize( PhoneInput );
