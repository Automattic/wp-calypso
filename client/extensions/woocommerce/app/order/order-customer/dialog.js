/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import emailValidator from 'email-validator';
import { find, get, isEmpty, noop } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AddressView from 'woocommerce/components/address-view';
import {
	areLocationsLoaded,
	getAllCountries,
} from 'woocommerce/state/sites/data/locations/selectors';
import {
	areSettingsGeneralLoaded,
	getStoreLocation,
} from 'woocommerce/state/sites/settings/general/selectors';
import { Button, Dialog } from '@automattic/components';
import { fetchLocations } from 'woocommerce/state/sites/data/locations/actions';
import { fetchSettingsGeneral } from 'woocommerce/state/sites/settings/general/actions';
import FormCheckbox from 'components/forms/form-checkbox';
import FormFieldset from 'components/forms/form-fieldset';
import FormInputValidation from 'components/forms/form-input-validation';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormPhoneMediaInput from 'components/forms/form-phone-media-input';
import FormTextInput from 'components/forms/form-text-input';
import getAddressViewFormat from 'woocommerce/lib/get-address-view-format';
import getCountries from 'state/selectors/get-countries';
import QueryPaymentCountries from 'components/data/query-countries/payments';

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
		areLocationsLoaded: PropTypes.bool,
		closeDialog: PropTypes.func,
		countries: PropTypes.arrayOf(
			PropTypes.shape( {
				code: PropTypes.string.isRequired,
				name: PropTypes.string.isRequired,
				states: PropTypes.arrayOf(
					PropTypes.shape( {
						code: PropTypes.string.isRequired,
						name: PropTypes.string.isRequired,
					} )
				),
			} )
		),
		countriesList: PropTypes.array.isRequired,
		isBilling: PropTypes.bool,
		isVisible: PropTypes.bool,
		siteId: PropTypes.number,
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

	maybeFetchLocations() {
		const { siteId } = this.props;

		if ( siteId && ! this.props.areLocationsLoaded ) {
			this.props.fetchLocations( siteId );
		}
	}

	componentDidMount() {
		this.initializeState();
		this.maybeFetchLocations();
	}

	UNSAFE_componentWillMount() {
		this.fetchData( this.props );
	}

	UNSAFE_componentWillReceiveProps( newProps ) {
		if ( newProps.siteId !== this.props.siteId ) {
			this.fetchData( newProps );
		}
	}

	componentDidUpdate( prevProps ) {
		// Modal was just opened
		if ( this.props.isVisible && ! prevProps.isVisible ) {
			this.initializeState();
		}
		this.maybeFetchLocations();
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

	onPhoneChange = ( phone ) => {
		this.setState( ( prevState ) => {
			const { address } = prevState;
			const newState = { ...address, phone: phone.value };
			return { address: newState, phoneCountry: phone.countryCode };
		} );
	};

	onChange = ( event ) => {
		const value = event.target.value;
		let name = event.target.name;
		if ( 'street' === name ) {
			name = 'address_1';
		} else if ( 'street2' === name ) {
			name = 'address_2';
		}
		this.setState( ( prevState ) => {
			const { address } = prevState;
			const newState = { address: { ...address, [ name ]: value } };

			// Users of AddressView isEditable must always update the state prop
			// passed to AddressView in the event of country changes
			if ( 'country' === name ) {
				const countryData = find( this.props.countries, { code: value } );
				if ( ! isEmpty( countryData.states ) ) {
					newState.address.state = countryData.states[ 0 ].code;
				} else {
					newState.address.state = '';
				}
			}

			return newState;
		} );
	};

	validateEmail = ( event ) => {
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
		this.setState( ( prevState ) => {
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
			<div className="order-customer__billing-fields">
				<FormFieldset>
					<QueryPaymentCountries />
					<FormPhoneMediaInput
						label={ translate( 'Phone number' ) }
						onChange={ this.onPhoneChange }
						countryCode={ this.state.phoneCountry }
						countriesList={ this.props.countriesList }
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
		const { countries, isBilling, isVisible, translate } = this.props;
		const { address, emailValidMessage } = this.state;
		if ( ! address || isEmpty( countries ) ) {
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
						{ isBilling ? translate( 'Billing details' ) : translate( 'Shipping details' ) }
					</FormLegend>
					<div className="order-customer__fieldset">
						<div className="order-customer__field">
							<FormLabel htmlFor="first_name">{ translate( 'First name' ) }</FormLabel>
							<FormTextInput
								id="first_name"
								name="first_name"
								value={ get( address, 'first_name', '' ) }
								onChange={ this.onChange }
							/>
						</div>
						<div className="order-customer__field">
							<FormLabel htmlFor="last_name">{ translate( 'Last name' ) }</FormLabel>
							<FormTextInput
								id="last_name"
								name="last_name"
								value={ get( address, 'last_name', '' ) }
								onChange={ this.onChange }
							/>
						</div>
					</div>
					<AddressView
						address={ getAddressViewFormat( address ) }
						countries={ countries }
						isEditable
						onChange={ this.onChange }
					/>
					{ this.renderBillingFields() }
				</FormFieldset>
			</Dialog>
		);
	}
}

export default connect(
	( state ) => {
		const address = getStoreLocation( state );
		const locationsLoaded = areLocationsLoaded( state );
		const areSettingsLoaded = areSettingsGeneralLoaded( state );
		const countries = getAllCountries( state );

		return {
			areLocationsLoaded: locationsLoaded,
			areSettingsLoaded,
			countries,
			countriesList: getCountries( state, 'payments' ),
			defaultCountry: address.country,
			defaultState: address.state,
		};
	},
	( dispatch ) => bindActionCreators( { fetchLocations, fetchSettingsGeneral }, dispatch )
)( localize( CustomerAddressDialog ) );
