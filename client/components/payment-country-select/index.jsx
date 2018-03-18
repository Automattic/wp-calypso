/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { filter, isFunction, noop, omit } from 'lodash';

/**
 * Internal dependencies
 */
import CountrySelect from 'my-sites/domains/components/form/country-select';
import { getPaymentCountryCode } from 'state/selectors';
import { setPaymentCountryCode } from 'state/ui/payment/actions';

export class PaymentCountrySelect extends Component {
	static propTypes = {
		name: PropTypes.string.isRequired,
		countriesList: PropTypes.object.isRequired,
		onCountrySelected: PropTypes.func,
		countryCode: PropTypes.string,
		updateGlobalCountryCode: PropTypes.func,
	};

	static defaultProps = {
		onCountrySelected: noop,
		countryCode: '',
		updateGlobalCountryCode: noop,
	};

	componentDidMount = () => {
		// Notify the callback function about the country (or lack thereof)
		// that is pre-selected at the time the component is first displayed.
		let countryCode = this.props.countryCode;
		if ( ! filter( this.props.countriesList.get(), { code: countryCode } ).length ) {
			// If the stored payment country isn't one of the allowed countries
			// for this component, pass along the default value instead (so
			// that the value the callback function receives never represents a
			// country that it considers to be an invalid choice, and so that
			// it always matches what the user actually sees pre-selected in
			// the form field).
			countryCode = '';
		}
		this.props.onCountrySelected( this.props.name, countryCode );
	};

	handleFieldChange = event => {
		this.props.updateGlobalCountryCode( event.target.value );
		// Notify the callback function that a new country was selected.
		this.props.onCountrySelected( event.target.name, event.target.value );
		// Also notify the standard onChange field handler, if there is one.
		if ( isFunction( this.props.onChange ) ) {
			this.props.onChange( event );
		}
	};

	render() {
		const propsToOmit = [
			// Don't pass down props associated with the global payment country
			// state.
			'countryCode',
			'updateGlobalCountryCode',
			// Don't pass down this component's custom props.
			'onCountrySelected',
			// Don't pass down standard CountrySelect props that this component
			// overrides.
			'value',
			'onChange',
		];
		return (
			<CountrySelect
				{ ...omit( this.props, propsToOmit ) }
				value={ this.props.countryCode }
				onChange={ this.handleFieldChange }
			/>
		);
	}
}

export default connect(
	state => {
		return {
			countryCode: getPaymentCountryCode( state ),
		};
	},
	dispatch => {
		return {
			updateGlobalCountryCode: newCountryCode => {
				dispatch( setPaymentCountryCode( newCountryCode ) );
			},
		};
	}
)( PaymentCountrySelect );
