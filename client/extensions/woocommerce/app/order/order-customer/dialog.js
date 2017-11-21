/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import emailValidator from 'email-validator';
import { get, noop } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AddressView from 'woocommerce/components/address-view';
import Button from 'components/button';
import Dialog from 'components/dialog';
import FormCheckbox from 'components/forms/form-checkbox';
import FormFieldset from 'components/forms/form-fieldset';
import FormInputValidation from 'components/forms/form-input-validation';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormPhoneMediaInput from 'components/forms/form-phone-media-input';
import FormTextInput from 'components/forms/form-text-input';
import getAddressViewFormat from 'woocommerce/lib/get-address-view-format';

// @todo Update this to use our store countries list
import countriesListBuilder from 'lib/countries-list';
const countriesList = countriesListBuilder.forPayments();

class CustomerAddressDialog extends Component {
	static propTypes = {
		address: PropTypes.shape( {
			address_1: PropTypes.string.isRequired,
			address_2: PropTypes.string,
			city: PropTypes.string.isRequired,
			state: PropTypes.string,
			country: PropTypes.string.isRequired,
			postcode: PropTypes.string,
			email: PropTypes.string,
			first_name: PropTypes.string.isRequired,
			last_name: PropTypes.string.isRequired,
			phone: PropTypes.string,
		} ),
		closeDialog: PropTypes.func,
		isBilling: PropTypes.bool,
		isVisible: PropTypes.bool,
		updateAddress: PropTypes.func.isRequired,
	};

	static defaultProps = {
		address: {
			street: '',
			street2: '',
			city: '',
			state: 'AL',
			country: 'US',
			postcode: '',
			email: '',
			first_name: '',
			last_name: '',
			phone: '',
		},
		closeDialog: noop,
		isBilling: false,
		isVisible: false,
		updateAddress: noop,
	};

	state = {};

	componentDidMount() {
		this.initializeState();
	}

	componentDidUpdate( prevProps ) {
		// Modal was just opened
		if ( this.props.isVisible && ! prevProps.isVisible ) {
			this.initializeState();
		}
	}

	initializeState = () => {
		const { address = {} } = this.props;
		this.setState( {
			address,
			phoneCountry: address.country || 'US',
			emailValidMessage: false,
		} );
	};

	updateAddress = () => {
		this.props.updateAddress( this.state.address );
		this.props.closeDialog();
	};

	closeDialog = () => {
		this.props.closeDialog();
	};

	onPhoneChange = phone => {
		this.setState( prevState => {
			const { address } = prevState;
			const newState = { ...address, phone: phone.value };
			return { address: newState, phoneCountry: phone.countryCode };
		} );
	};

	onChange = event => {
		const value = event.target.value;
		let name = event.target.name;
		if ( 'street' === name ) {
			name = 'address_1';
		} else if ( 'street2' === name ) {
			name = 'address_2';
		}
		this.setState( prevState => {
			const { address } = prevState;
			const newState = { ...address, [ name ]: value };
			// If country changed, we should also reset the state
			if ( 'country' === name ) {
				newState.state = '';
			}
			return { address: newState };
		} );
	};

	validateEmail = event => {
		const { translate } = this.props;
		if ( ! emailValidator.validate( event.target.value ) ) {
			this.setState( {
				emailValidMessage: translate( 'Please enter a valid email address.' ),
			} );
		} else {
			this.setState( {
				emailValidMessage: false,
			} );
		}
	};

	toggleShipping = () => {
		this.setState( prevState => {
			const { address } = prevState;
			const newState = { ...address, copyToShipping: ! prevState.address.copyToShipping };
			return { address: newState };
		} );
	};

	renderBillingFields = () => {
		const { isBilling, translate } = this.props;
		const { address, emailValidMessage } = this.state;
		if ( ! isBilling ) {
			return null;
		}
		return (
			<div>
				<FormFieldset>
					<FormPhoneMediaInput
						label={ translate( 'Phone Number' ) }
						onChange={ this.onPhoneChange }
						countryCode={ this.state.phoneCountry }
						countriesList={ countriesList }
						value={ get( address, 'phone', '' ) }
					/>
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="email">{ translate( 'Email address' ) }</FormLabel>
					<FormTextInput
						id="email"
						name="email"
						value={ get( address, 'email', '' ) }
						onChange={ this.onChange }
						onBlur={ this.validateEmail }
					/>
					{ emailValidMessage && <FormInputValidation text={ emailValidMessage } isError /> }
				</FormFieldset>
				<FormFieldset>
					<FormLabel>
						<FormCheckbox
							checked={ get( address, 'copyToShipping', false ) }
							onChange={ this.toggleShipping }
						/>
						<span>{ translate( 'Copy changes to shipping' ) }</span>
					</FormLabel>
				</FormFieldset>
			</div>
		);
	};

	render() {
		const { isBilling, isVisible, translate } = this.props;
		const { address, emailValidMessage } = this.state;
		if ( ! address ) {
			return null;
		}

		const dialogButtons = [
			<Button onClick={ this.closeDialog }>{ translate( 'Close' ) }</Button>,
			<Button primary onClick={ this.updateAddress } disabled={ !! emailValidMessage }>
				{ translate( 'Save' ) }
			</Button>,
		];

		return (
			<Dialog
				isVisible={ isVisible }
				onClose={ this.closeDialog }
				className="order-customer__dialog woocommerce"
				buttons={ dialogButtons }
			>
				<FormFieldset>
					<FormLegend className="order-customer__billing-details">
						{ isBilling ? translate( 'Billing Details' ) : translate( 'Shipping Details' ) }
					</FormLegend>
					<div className="order-customer__fieldset">
						<div className="order-customer__field">
							<FormLabel htmlFor="first_name">{ translate( 'First Name' ) }</FormLabel>
							<FormTextInput
								id="first_name"
								name="first_name"
								value={ get( address, 'first_name', '' ) }
								onChange={ this.onChange }
							/>
						</div>
						<div className="order-customer__field">
							<FormLabel htmlFor="last_name">{ translate( 'Last Name' ) }</FormLabel>
							<FormTextInput
								id="last_name"
								name="last_name"
								value={ get( address, 'last_name', '' ) }
								onChange={ this.onChange }
							/>
						</div>
					</div>
					<AddressView
						isEditable
						showAllLocations
						onChange={ this.onChange }
						address={ getAddressViewFormat( address ) }
					/>
					{ this.renderBillingFields() }
				</FormFieldset>
			</Dialog>
		);
	}
}

export default localize( CustomerAddressDialog );
