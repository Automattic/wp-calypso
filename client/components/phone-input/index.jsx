/**
 * External dependencies
 */
import React from 'react';
import { find, identity } from 'lodash';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import FormCountrySelect from 'components/forms/form-country-select';
import {
	formatNumber,
	findCountryFromNumber,
	processNumber,
	MIN_LENGTH_TO_FORMAT,
} from 'components/phone-input/phone-number';
import CountryFlag from 'components/phone-input/country-flag';
import { countries } from 'components/phone-input/data';

/**
 * Style dependencies
 */
import './style.scss';

class PhoneInput extends React.PureComponent {
	static propTypes = {
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

	static defaultProps = {
		enableStickyCountry: true,
	};

	state = {
		freezeSelection: false,
	};

	numberInput = undefined;

	setNumberInputRef = ( element ) => {
		this.numberInput = element;

		const { inputRef } = this.props;

		if ( ! inputRef ) {
			return;
		}

		if ( typeof inputRef === 'function' ) {
			inputRef( element );
		} else {
			inputRef.current = element;
		}
	};

	/**
	 * Returns the country meta with default values for countries with missing metadata. Never returns null.
	 * @param {string} [countryCode=this.props.countryCode] - The country code
	 * @returns {countryMetadata} - Country metadata
	 */
	getCountry( countryCode = this.props.countryCode ) {
		let selectedCountry = countries[ countryCode ];

		if ( ! selectedCountry ) {
			// Special cases where the country is in a disputed region and not globally recognized.
			// At this point this should only be used for: Canary islands, Kosovo, Netherlands Antilles
			const data = find( this.props.countriesList || [], ( { code } ) => code === countryCode );

			selectedCountry = {
				isoCode: countryCode,
				dialCode: ( ( data && data.numeric_code ) || '' ).replace( '+', '' ),
				nationalPrefix: '',
			};
		}
		return selectedCountry;
	}

	componentDidMount() {
		const { countryCode, value } = this.calculateInputAndCountryCode(
			this.props.value,
			this.props.countryCode
		);
		this.numberInput.value = value;
		if ( value !== this.props.value || countryCode !== this.props.countryCode ) {
			this.props.onChange( { value, countryCode } );
		}
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if (
			nextProps.value === this.props.value &&
			nextProps.countryCode === this.props.countryCode
		) {
			return;
		}
		const { countryCode, value } = this.calculateInputAndCountryCode(
			nextProps.value,
			nextProps.countryCode
		);
		this.props.onChange( { value, countryCode } );
	}

	UNSAFE_componentWillUpdate( nextProps ) {
		if (
			nextProps.value === this.props.value &&
			nextProps.countryCode === this.props.countryCode
		) {
			return;
		}
		const currentFormat = this.props.value;
		const currentCursorPoint = this.numberInput.selectionStart;
		const nextFormat = nextProps.value;

		let newCursorPoint = currentCursorPoint;
		/*
		We are setting the value of numberInput here instead of using a prop because we need direct control over when and how
		it is updated in order to move the cursor to the exact point we want. I haven't noticed any side effects of this and
		it is working normally. In case it starts to create problems, we can try to split this logic between `componentWillUpdate`
		and `componentDidUpdate` and store the cursor position in the state or in `this`.
		 */
		this.numberInput.value = nextFormat;

		const nonDigitCountOld = currentFormat
			.substring( 0, currentCursorPoint )
			.split( '' )
			.map( ( char ) => /\D/.test( char ) )
			.filter( identity ).length;

		const nonDigitCountNew = nextFormat
			.substring( 0, currentCursorPoint )
			.split( '' )
			.map( ( char ) => /\D/.test( char ) )
			.filter( identity ).length;

		if ( currentFormat !== nextFormat ) {
			if ( currentCursorPoint >= currentFormat.length ) {
				newCursorPoint = nextFormat.length;
			} else {
				newCursorPoint = currentCursorPoint + nonDigitCountNew - nonDigitCountOld;
			}
		}
		this.numberInput.setSelectionRange( newCursorPoint, newCursorPoint );
	}

	/**
	 * Decides whether to guess the country from the input value
	 * @param {string} value - The phone number
	 * @returns {boolean} - Whether to guess the country or not
	 */
	shouldGuessCountry( value ) {
		if ( ! value || value.length < MIN_LENGTH_TO_FORMAT || this.state.freezeSelection ) {
			return false;
		}
		const dialCode = this.getCountry().countryDialCode || this.getCountry().dialCode;
		return value[ 0 ] === '+' || ( value[ 0 ] === '1' && dialCode === '1' );
	}

	/**
	 * Returns the selected country from dropdown or guesses the country from input
	 * @param {string} value - Input number
	 * @param {string} [fallbackCountryCode=this.props.countryCode] - Fallback country code in case we can't find a match
	 * @returns {countryMetadata} - Country Metadata
	 */
	guessCountryFromValueOrGetSelected( value, fallbackCountryCode = this.props.countryCode ) {
		if ( this.shouldGuessCountry( value ) ) {
			return findCountryFromNumber( value ) || this.getCountry( 'world' );
		}

		return this.getCountry( fallbackCountryCode );
	}

	format( value = this.props.value, countryCode = this.props.countryCode ) {
		return formatNumber( value, this.getCountry( countryCode ) );
	}

	handleInput = ( event ) => {
		const inputValue = event.target.value;
		if ( inputValue === this.props.value ) {
			// nothing changed
			return;
		}

		event.preventDefault();

		const { countryCode, value } = this.calculateInputAndCountryCode(
			inputValue,
			this.props.countryCode
		);

		this.props.onChange( { value, countryCode } );
	};

	/**
	 * Calculates the input and country
	 * @param {string} value - Phone number
	 * @param {string} countryCode - The country code
	 * @returns {{value: string, countryCode: string}} - Result
	 */
	calculateInputAndCountryCode( value, countryCode ) {
		const calculatedCountry = this.guessCountryFromValueOrGetSelected( value, countryCode ),
			calculatedValue = this.format( value, calculatedCountry.isoCode ),
			calculatedCountryCode = calculatedCountry.isoCode;

		return { value: calculatedValue, countryCode: calculatedCountryCode };
	}

	handleCountrySelection = ( event ) => {
		const newCountryCode = event.target.value;
		if ( newCountryCode === this.props.countryCode ) {
			return;
		}
		let inputValue = this.props.value;
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
		const { nationalNumber } = processNumber(
			this.props.value,
			this.getCountry( this.props.countryCode )
		);
		if ( this.props.value[ 0 ] !== '+' ) {
			inputValue = nationalNumber;
		} else {
			inputValue = '+' + this.getCountry( newCountryCode ).dialCode + nationalNumber;
		}
		this.props.onChange( {
			countryCode: newCountryCode,
			value: this.format( inputValue, newCountryCode ),
		} );
		this.setState( { freezeSelection: this.props.enableStickyCountry } );
	};

	render() {
		return (
			<div className={ classnames( this.props.className, 'phone-input' ) }>
				<input
					placeholder={ this.props.translate( 'Phone' ) }
					onChange={ this.handleInput }
					name={ this.props.name }
					ref={ this.setNumberInputRef }
					type="tel"
					disabled={ this.props.disabled }
					className={ classnames( 'phone-input__number-input', {
						'is-error': this.props.isError,
					} ) }
				/>
				<div className="phone-input__select-container">
					<div className="phone-input__select-inner-container">
						<FormCountrySelect
							tabIndex={ -1 }
							className="phone-input__country-select"
							onChange={ this.handleCountrySelection }
							value={ this.getCountry().isoCode }
							countriesList={ this.props.countriesList }
							disabled={ this.props.disabled }
						/>
						<CountryFlag countryCode={ this.getCountry().isoCode.toLowerCase() } />
					</div>
				</div>
			</div>
		);
	}
}

export default localize( PhoneInput );
