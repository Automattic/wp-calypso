/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormCurrencyInput from 'components/forms/form-currency-input';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';

class FreeShippingMethod extends Component {
	constructor( props ) {
		super( props );

		//TODO: use redux state with real data
		this.state = {
			everyone: props.everyone,
			currencySymbolPrefix: '$',
			currencySymbolSuffix: ''
		};
	}

	renderMinSpendBox() {
		return (
			<FormCurrencyInput
				currencySymbolPrefix={ this.state.currencySymbolPrefix }
				currencySymbolSuffix={ this.state.currencySymbolSuffix }
				value={ this.state.minSpend } />
		);
	}

	render() {
		const { translate } = this.props;

		const onOptionChange = ( event ) => {
			this.setState( { everyone: 'everyone' === event.currentTarget.value } );
		};

		return (
			<div className="shipping-methods__method-container">
				<FormLabel>{ translate( 'Who gets free shipping?' ) }</FormLabel>
				<div className="shipping-methods__free-shipping-option">
					<FormRadio value="everyone"
						checked={ this.state.everyone }
						onChange={ onOptionChange } />
					{ translate( 'Everyone!' ) }
				</div>
				<div className="shipping-methods__free-shipping-option">
					<FormRadio value="paying" checked={ ! this.state.everyone } onChange={ onOptionChange } />
					{ translate( 'Customers that spend {{priceInput/}} or more per order', {
						components: {
							priceInput: this.renderMinSpendBox()
						}
					} ) }
				</div>
			</div>
		);
	}
}

FreeShippingMethod.propTypes = {
	everyone: PropTypes.bool.isRequired,
};

export default localize( FreeShippingMethod );
