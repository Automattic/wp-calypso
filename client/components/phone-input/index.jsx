/**
 * External dependencies
 */
import noop from 'lodash/noop';
import find from 'lodash/find';
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
		onChange: React.PropTypes.func,
		value: React.PropTypes.string,
		selectedCountryCode: React.PropTypes.string.isRequired,
		countriesList: React.PropTypes.object.isRequired
	},

	getDefaultProps() {
		return {
			value: '',
			onChange: noop,
		};
	},

	getInitialState() {
		const selectedCountry = countries[ this.props.selectedCountryCode ];
		const formattedNumber = formatNumber( this.props.value, selectedCountry );
		return {
			selectedCountry,
			formattedNumber,
			queryString: '',
			freezeSelection: false
		};
	},

	componentWillReceiveProps( nextProps ) {
		if ( this.props.value !== nextProps.value && nextProps.value ) {
			this.setState( this.getFormattedNumberAndCountry( nextProps.value ) );
		}
	},

	componentDidUpdate( prevProps, prevState ) {
		if ( this.state.value && this.state.selectedCountry !== prevState.selectedCountry ) {
			this.setState( {
				formattedNumber: formatNumber( this.state.value, this.state.selectedCountry )
			} );
		}
	},

	getFormattedNumberAndCountry: function( value ) {
		let formattedNumber = value,
			selectedCountry = this.state.selectedCountry;

		if ( value ) {
			if ( ( value[ 0 ] === '+' || value[ 0 ] === '1' ) && ! this.state.freezeSelection ) {
				selectedCountry = findCountryFromNumber( value ) || this.state.selectedCountry;
			}

			formattedNumber = formatNumber( value, selectedCountry );
		}
		return {
			selectedCountry,
			formattedNumber
		}
	},

	handleInput( event ) {
		const { value } = event.target;
		if ( value === this.state.formattedNumber ) {
			// nothing changed
			return;
		}

		event.preventDefault();
		let { formattedNumber, selectedCountry } = this.getFormattedNumberAndCountry( value );

		let caretPosition = event.target.selectionStart;
		const oldFormattedText = this.state.formattedNumber;
		const diff = formattedNumber.length - oldFormattedText.length;

		this.setState( {
			value,
			formattedNumber,
			selectedCountry
		}, () => {
			if ( diff > 0 ) {
				caretPosition = caretPosition - diff;
			}

			if ( caretPosition > 0 && oldFormattedText.length >= formattedNumber.length ) {
				this.numberInput.setSelectionRange( caretPosition, caretPosition );
			}

		} );
		this.props.onChange( event );
	},

	cursorToEnd() {
		const pos = this.numberInput.value.length - 1;
		this.numberInput.setSelectionRange( pos, pos );
	},

	handleCountrySelection( event ) {
		const countryCode = event.target.value.toLowerCase();
		let selectedCountry = countries[ countryCode ];
		// Special cases where the country is in a disputed region and not globally recognized.
		// At this point this should only be used for: Canary islands, Kosovo, Netherlands Antilles
		if ( ! selectedCountry ) {
			const data = find( this.props.countriesList.get() || [],
				country => country.code.toLowerCase() === countryCode );
			if ( data ) {
				selectedCountry = {
					isoCode: countryCode,
					dialCode: data.numeric_code.replace('+', ''),
					nationalPrefix: ''
				}
			}
		}

		this.setState( {
			selectedCountry,
			freezeSelection: true
		} );
	},

	getCountry() {
		return this.state.selectedCountry
	},

	render() {
		return (
			<div className={ classnames( this.props.className, 'phone-input' ) }>
				<input
					placeholder={ formatNumber(
						( this.state.selectedCountry.nationalPrefix || '' ) + '9876543210', this.state.selectedCountry
					) }
					onChange={ this.handleInput }
					name={ this.props.name }
					value={ this.state.formattedNumber }
					ref={ c => this.numberInput = c }
					type="tel" />
				<div className="phone-input__select-container">
					<div className="phone-input__select-inner-container">
						<FormCountrySelect
							className="phone-input__country-select"
							onChange={ this.handleCountrySelection }
							value={ ( this.state.selectedCountry.isoCode || '' ).toUpperCase() }
							countriesList={ this.props.countriesList } />
						<CountryFlag countryCode={ this.state.selectedCountry.isoCode } />
					</div>
				</div>
			</div>
		);
	}
} );

export default PhoneInput;

