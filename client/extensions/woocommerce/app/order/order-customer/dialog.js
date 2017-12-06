/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import emailValidator from 'email-validator';
import { get, noop } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AddressView from 'woocommerce/components/address-view';
import {
	areSettingsGeneralLoaded,
	getStoreLocation,
} from 'woocommerce/state/sites/settings/general/selectors';
import Button from 'components/button';
import Dialog from 'components/dialog';
import { fetchSettingsGeneral } from 'woocommerce/state/sites/settings/general/actions';
import FormCheckbox from 'components/forms/form-checkbox';
import FormFieldset from 'components/forms/form-fieldset';
import FormInputValidation from 'components/forms/form-input-validation';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormPhoneMediaInput from 'components/forms/form-phone-media-input';
import FormTextInput from 'components/forms/form-text-input';
import getAddressViewFormat from 'woocommerce/lib/get-address-view-format';
// @todo Update this to use our store countries list
import { forPayments as countriesList } from 'lib/countries-list';

const defaultAddress = {
	street: '',
	street2: '',
	city: '',
	postcode: '',
	email: '',
	first_name: '',
	last_name: '',
	phone: '',
};

class CustomerAddressDialog extends Component {
	static propTypes = {
		address: PropTypes.shape( {
			address_1: PropTypes.string,
			address_2: PropTypes.string,
			city: PropTypes.string,
			state: PropTypes.string,
			country: PropTypes.string,
			postcode: PropTypes.string,
			email: PropTypes.string,
			first_name: PropTypes.string,
			last_name: PropTypes.string,
			phone: PropTypes.string,
		} ),
		closeDialog: PropTypes.func,
		isBilling: PropTypes.bool,
		isVisible: PropTypes.bool,
		updateAddress: PropTypes.func.isRequired,
	};

	static defaultProps = {
		address: defaultAddress,
		closeDialog: noop,
		isBilling: false,
		isVisible: false,
		updateAddress: noop,
	};

	state = {};

	componentDidMount() {
		this.initializeState();
	}

	componentWillMount() {
		this.fetchData( this.props );
	}

	componentWillReceiveProps( newProps ) {
		if ( newProps.siteId !== this.props.siteId ) {
			this.fetchData( newProps );
		}
	}

	componentDidUpdate( prevProps ) {
		// Modal was just opened
		if ( this.props.isVisible && ! prevProps.isVisible ) {
			this.initializeState();
		}
	}

	initializeState = () => {
		const { defaultCountry, defaultState } = this.props;
		const address = {
			...defaultAddress,
			country: defaultCountry,
			state: defaultState,
			...this.props.address,
		};
		this.setState( {
			address,
			phoneCountry: address.country || defaultCountry,
			emailValidMessage: false,
		} );
	};

	fetchData = ( { siteId, areSettingsLoaded } ) => {
		if ( ! siteId ) {
			return;
		}
		if ( ! areSettingsLoaded ) {
			this.props.fetchSettingsGeneral( siteId );
		}
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
			const newState = { address: { ...address, [ name ]: value } };
			// If country changed, we should also reset the state & phoneCountry
			if ( 'country' === name ) {
				newState.address.state = '';
				newState.phoneCountry = value;
			}
			return newState;
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

export default connect(
	state => {
		const address = getStoreLocation( state );
		const areSettingsLoaded = areSettingsGeneralLoaded( state );

		return {
			areSettingsLoaded,
			defaultCountry: address.country,
			defaultState: address.state,
		};
	},
	dispatch => bindActionCreators( { fetchSettingsGeneral }, dispatch )
)( localize( CustomerAddressDialog ) );
