/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { isFunction, noop, omit } from 'lodash';

/**
 * Internal dependencies
 */

import CountrySelect from 'my-sites/domains/components/form/country-select';
import { getPaymentCountryCode } from 'state/selectors';
import { setPaymentCountryCode } from 'state/ui/payment/actions';

class PaymentCountrySelect extends Component {
	static propTypes = {
		name: PropTypes.string.isRequired,
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
		this.props.onCountrySelected( this.props.name, this.props.countryCode );
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
