/**
 * External dependencies
 */
import find from 'lodash/find';
import identity from 'lodash/identity';
import includes from 'lodash/includes';
import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import FormCountrySelect from 'components/forms/form-country-select';
import { formatNumber, findCountryFromNumber } from './phone-number';
import CountryFlag from './country-flag';
import { countries } from './data';

const PhoneInput = React.createClass( {
	propTypes: {
		onChange: React.PropTypes.func.isRequired,
		value: React.PropTypes.string.isRequired,
		countryCode: React.PropTypes.string.isRequired,
		countriesList: React.PropTypes.object.isRequired
	},

	getCountry( countryCode = this.props.countryCode ) {
		let selectedCountry = countries[ countryCode ];

		if ( ! selectedCountry ) {
			const data = find( this.props.countriesList.get() || [],
				country => country.code === countryCode );
			// Special cases where the country is in a disputed region and not globally recognized.
			// At this point this should only be used for: Canary islands, Kosovo, Netherlands Antilles
			if ( data && data.numeric_code ) {
				selectedCountry = {
					isoCode: countryCode,
					dialCode: data.numeric_code.replace( '+', '' ),
					nationalPrefix: ''
				};
			} else {
				selectedCountry = {
					isoCode: countryCode,
					dialCode: '',
					nationalPrefix: ''
				};
			}
		}
		return selectedCountry;
	},

	getInitialState() {
		return {
			freezeSelection: false
		};
	},

	componentWillReceiveProps() {
		// todo ensure the number is formatted if when loading from somewhere else
	},

	componentWillUpdate( nextProps ) {
		const currentFormat = this.props.value,
			currentCursorPoint = this.numberInput.selectionStart,
			nextFormat = nextProps.value;

		let newCursorPoint = currentCursorPoint;
		this.numberInput.value = nextFormat;

		const nonDigitCountOld = currentFormat
			.substring( 0, currentCursorPoint )
			.split( '' )
			.map( char => /\D/.test( char ) )
			.filter( identity ).length;

		const nonDigitCountNew = nextFormat
			.substring( 0, currentCursorPoint )
			.split( '' )
			.map( char => /\D/.test( char ) )
			.filter( identity ).length;

		if ( currentFormat !== nextFormat ) {
			if ( currentCursorPoint >= currentFormat.length ) {
				newCursorPoint = nextFormat.length;
			} else {
				newCursorPoint = currentCursorPoint + nonDigitCountNew - nonDigitCountOld;
			}
		}
		this.numberInput.setSelectionRange( newCursorPoint, newCursorPoint );
	},

	guessCountryFromValue( value ) {
		if ( value && includes( [ '+', '1' ], value[ 0 ] ) && ! this.state.freezeSelection ) {
			return findCountryFromNumber( value );
		}

		return this.getCountry();
	},

	format( { value, countryCode } = this.props ) {
		return formatNumber( value, this.getCountry( countryCode ) );
	},

	handleInput( event ) {
		const { value } = event.target;
		if ( value === this.props.value ) {
			// nothing changed
			return;
		}

		event.preventDefault();

		const country = this.guessCountryFromValue( value );
		if ( this.state.freezeSelection && value.indexOf( country.dialCode ) === -1 ) {
			return;
		}
		if ( country ) {
			// todo ??
			this.props.onChange( {
				value: this.format( { value, countryCode: country.isoCode } ),
				countryCode: country.isoCode
			} );
		} else if ( value.length > 3 ) {
			this.props.onChange( {
				value,
				countryCode: 'world'
			} );
		} else {
			this.props.onChange( {
				value,
				countryCode: this.props.countryCode.toUpperCase()
			} );
		}
	},

	handleCountrySelection( event ) {
		const newCountryCode = event.target.value;
		if ( newCountryCode === this.props.countryCode ) {
			return;
		}
		// if the country changes, we fix the dial code
		const value = this.props.value.replace(
			this.getCountry( this.props.countryCode.toUpperCase() ).dialCode,
			this.getCountry( newCountryCode ).dialCode
		);
		this.props.onChange( {
			countryCode: newCountryCode,
			value: this.format( { value, countryCode: newCountryCode } )
		} );
		this.setState( { freezeSelection: true } );
	},

	render() {
		return (
			<div className={ classnames( this.props.className, 'phone-input' ) }>
				<input
					placeholder={ formatNumber( ( this.getCountry().nationalPrefix ) + '9876543210', this.getCountry() ) }
					onChange={ this.handleInput }
					name={ this.props.name }
					ref={ c => this.numberInput = c }
					type="tel" />
				<div className="phone-input__select-container">
					<div className="phone-input__select-inner-container">
						<FormCountrySelect
							className="phone-input__country-select"
							onChange={ this.handleCountrySelection }
							value={ ( this.getCountry().isoCode ) }
							countriesList={ this.props.countriesList } />
						<CountryFlag countryCode={ this.getCountry().isoCode.toLowerCase() } />
					</div>
				</div>
			</div>
		);
	}
} );

export default PhoneInput;

