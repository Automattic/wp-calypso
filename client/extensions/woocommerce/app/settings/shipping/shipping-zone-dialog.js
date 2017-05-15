/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Dialog from 'components/dialog';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import FormTextInput from 'components/forms/form-text-input';
import FreeShippingMethod from './shipping-methods/free-shipping';
import LocalPickupMethod from './shipping-methods/local-pickup';
import TokenField from 'components/token-field';

class ShippingZoneDialog extends Component {
	constructor( props ) {
		super( props );

		this.freeShippingDefaults = {
			methodId: 'free',
			everyone: true,
			minSpend: 0
		};

		this.localPickupDefaults = {
			methodId: 'local',
			price: 0,
			taxable: false
		};

		this.state = {
			location: [],
			shippingMethods: [ { ...this.freeShippingDefaults } ]
		};
	}

	changeShippingMethod( index, value ) {
		const shippingMethods = this.state.shippingMethods;
		if ( 'free' === value ) {
			shippingMethods[ index ] = { ...this.freeShippingDefaults };
		} else {
			shippingMethods[ index ] = { ...this.localPickupDefaults };
		}

		this.setState( { shippingMethods } );
	}

	render() {
		const { translate, isVisible, onClose } = this.props;
		const buttons = [
			{ action: 'cancel', label: translate( 'Cancel' ) },
			{ action: 'add', label: translate( 'Add zone' ), isPrimary: true },
		];

		const onLocationChange = ( location ) => {
			this.setState( { location } );
		};

		const addMethod = () => {
			const shippingMethods = this.state.shippingMethods;
			shippingMethods.push( { ...this.freeShippingDefaults } );
			this.setState( { shippingMethods } );
		};

		const renderShippingMethod = ( method, index ) => {
			const { methodId } = method;

			const onMethodChange = ( event ) => {
				this.changeShippingMethod( index, event.target.value );
			};

			return (
				<div key={ index }>
					<FormSelect
						value={ methodId }
						onChange={ onMethodChange } >
						<option value="free">{ translate( 'Free shipping' ) }</option>
						<option value="local">{ translate( 'Local pickup' ) }</option>
					</FormSelect>
					{ 'free' === methodId
						? <FreeShippingMethod { ...method } />
						: <LocalPickupMethod { ...method } /> }
				</div>
			);
		};

		return (
			<Dialog
				additionalClassNames="shipping__zone-dialog woocommerce"
				isVisible={ isVisible }
				buttons={ buttons }
				onClose={ onClose } >
				<div className="shipping__zone-dialog-header">{ translate( 'Add new shipping zone' ) }</div>
				<FormFieldSet>
					<FormLabel htmlFor="zone-name">{ translate( 'Shipping zone name' ) }</FormLabel>
					<FormTextInput
						name="zone-name"
						placeholder={ translate( 'For your reference only, the customer will not see this' ) } />
				</FormFieldSet>
				<FormFieldSet>
					<FormLabel>{ translate( 'Shipping location' ) }</FormLabel>
					<TokenField
						value={ this.state.location }
						onChange={ onLocationChange } />
				</FormFieldSet>
				<div>
					<FormLabel>{ translate( 'Shipping method' ) }</FormLabel>
					{ this.state.shippingMethods.map( renderShippingMethod ) }
				</div>
				<FormFieldSet>
					<Button compact onClick={ addMethod }>{ translate( 'Add another shipping method' ) }</Button>
				</FormFieldSet>
			</Dialog>
		);
	}
}

ShippingZoneDialog.propTypes = {
	isVisible: PropTypes.bool,
	onClose: PropTypes.func
};

export default localize( ShippingZoneDialog );
