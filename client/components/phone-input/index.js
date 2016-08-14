/**
 * External dependencies
 */
import noop from 'lodash';
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import FormCountrySelect from 'components/forms/form-country-select';
import Spinner from 'components/spinner';
import { formatNumber, findCountryFromNumber } from './phone-number';
import { countries } from './data';

const PhoneInput = React.createClass( {
	propTypes: {
		onChange: React.PropTypes.func,
		initialValue: React.PropTypes.string,
		selectedCountryCode: React.PropTypes.string.isRequired,
		countriesList: React.PropTypes.object.isRequired
	},

	getDefaultProps() {
		return {
			initialValue: '',
			onChange: noop,
		};
	},

	getInitialState() {
		const selectedCountry = countries[ this.props.selectedCountryCode ];
		const formattedNumber = formatNumber( this.props.initialValue, selectedCountry );
		return {
			selectedCountry,
			formattedNumber,
			queryString: '',
			freezeSelection: false
		};
	},

	componentDidUpdate( prevProps, prevState ) {
		if ( this.state.value && this.state.selectedCountry !== prevState.selectedCountry ) {
			this.setState( {
				formattedNumber: formatNumber( this.state.value, this.state.selectedCountry.format )
			} );
		}
	},

	handleInput( event ) {
		let formattedNumber = '',
			newSelectedCountry = this.state.selectedCountry,
			freezeSelection = this.state.freezeSelection;

		let value = event.target.value;
		if ( value === this.state.formattedNumber ) {
			// nothing changed
			return;
		}

		event.preventDefault();

		if ( value ) {
			if ( ( value[ 0 ] === '+' || value[ 0 ] === '1' ) && ! this.state.freezeSelection ) {
				newSelectedCountry = findCountryFromNumber( value ) || this.state.selectedCountry;
			}

			formattedNumber = formatNumber( value, newSelectedCountry );
		}

		let caretPosition = event.target.selectionStart;
		let oldFormattedText = this.state.formattedNumber;
		let diff = formattedNumber.length - oldFormattedText.length;

		this.setState( {
			value,
			formattedNumber,
			freezeSelection,
			selectedCountry: newSelectedCountry
		}, () => {
			if ( diff > 0 ) {
				caretPosition = caretPosition - diff;
			}

			if ( caretPosition > 0 && oldFormattedText.length >= formattedNumber.length ) {
				this.numberInput.setSelectionRange( caretPosition, caretPosition );
			}

			this.props.onChange( this.state.formattedNumber );
		} );
	},

	cursorToEnd() {
		const pos = this.numberInput.value.length - 1;
		this.numberInput.setSelectionRange( pos, pos )
	},

	handleCountrySelection( event ) {
		const countryCode = event.target.value.toLowerCase();
		this.setState( {
			selectedCountry: countries[ countryCode ],
			freezeSelection: true
		} );
	},

	render() {
		const flagClasses = classNames(
			'phone-input__flag-icon',
			'flag-icon',
			`flag-icon-${this.state.selectedCountry.isoCode}` );

		return (
			<div className="phone-input">
				<input
					placeholder={ formatNumber( ( this.state.selectedCountry.nationalPrefix || '' ) + '9876543210', this.state.selectedCountry ) }
					onChange={ this.handleInput }
					value={ this.state.formattedNumber }
					ref={ c => this.numberInput = c }
					type="tel" />
				<div className="phone-input__flag-container">
					<FormCountrySelect
						className="phone-input__country-select"
						onChange={ this.handleCountrySelection }
						countriesList={ this.props.countriesList } />
					<div className={ flagClasses } />
					<Spinner size={ 16 } className="phone-input__flag-spinner" />
				</div>
			</div>
		)
	}
} );

export default PhoneInput;

