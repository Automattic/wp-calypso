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
				country => country.code.toLowerCase() === countryCode );
			// Special cases where the country is in a disputed region and not globally recognized.
			// At this point this should only be used for: Canary islands, Kosovo, Netherlands Antilles
			if ( data ) {
				selectedCountry = {
					isoCode: countryCode,
					dialCode: data.numeric_code.replace( '+', '' ),
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

	componentWillReceiveProps( nextProps ) {
		if ( this.props.value !== nextProps.value && nextProps.value ) {
			const country = this.guessCountryFromValue( nextProps.value );
			if ( country && country.isoCode !== this.getCountry().isoCode ) {
				this.props.onChange( { countryCode: country.isoCode, value: nextProps.value } );
			}
		}
	},

	componentWillUpdate( nextProps ) {
		const currentFormat = this.format( this.props ),
			currentCursorPoint = this.numberInput.selectionStart,
			nextFormat = this.format( nextProps );

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
			return findCountryFromNumber( value ) || this.getCountry();
		}

		return this.getCountry();
	},

	format( { value, countryCode } = this.props ) {
		return formatNumber( value, this.getCountry( countryCode ) );
	},

	handleInput( event ) {
		const { value } = event.target;
		if ( value === this.format() ) {
			// nothing changed
			return;
		}

		event.preventDefault();

		const country = this.guessCountryFromValue( value );
		this.props.onChange( { value, countryCode: country.isoCode } );
	},

	handleCountrySelection( event ) {
		const countryCode = event.target.value.toLowerCase();

		this.props.onChange( { countryCode, value: this.props.value } );
		this.setState( { freezeSelection: true } );
	},

	render() {
		return (
			<div className={ classnames( this.props.className, 'phone-input' ) }>
				<input
					placeholder={ formatNumber( ( this.getCountry().nationalPrefix || '' ) + '9876543210', this.getCountry() ) }
					onChange={ this.handleInput }
					name={ this.props.name }
					ref={ c => this.numberInput = c }
					type="tel" />
				<div className="phone-input__select-container">
					<div className="phone-input__select-inner-container">
						<FormCountrySelect
							className="phone-input__country-select"
							onChange={ this.handleCountrySelection }
							value={ ( this.getCountry().isoCode || '' ).toUpperCase() }
							countriesList={ this.props.countriesList } />
						<CountryFlag countryCode={ this.getCountry().isoCode } />
					</div>
				</div>
			</div>
		);
	}
} );

export default PhoneInput;

