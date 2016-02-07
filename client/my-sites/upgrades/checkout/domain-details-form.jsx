/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import map from 'lodash/map';
import camelCase from 'lodash/camelCase';

/**
 * Internal dependencies
 */
import { CountrySelect, StateSelect, Input, HiddenInput } from 'my-sites/upgrades/components/form';
import PrivacyProtection from './privacy-protection';
import PaymentBox from './payment-box';
import { cartItems } from 'lib/cart-values';
import { forDomainRegistrations as countriesListForDomainRegistrations } from 'lib/countries-list';
import { forDomainRegistrations as statesListForDomainRegistrations } from 'lib/states-list';
import notices from 'notices';
import ValidationErrorList from 'notices/validation-error-list';
import analytics from 'analytics';
import formState from 'lib/form-state';
import upgradesActions from 'lib/upgrades/actions';

// Cannot convert to ES6 import
const wpcom = require( 'lib/wp' ).undocumented(),
	countriesList = countriesListForDomainRegistrations(),
	statesList = statesListForDomainRegistrations();

export default React.createClass( {
	displayName: 'DomainDetailsForm',

	fieldNames: [
		'firstName',
		'lastName',
		'organization',
		'email',
		'phone',
		'address1',
		'address2',
		'city',
		'state',
		'postalCode',
		'countryCode',
		'fax'
	],

	getInitialState() {
		return {
			form: null,
			isDialogVisible: false
		};
	},

	componentWillMount() {
		this.formStateController = formState.Controller( {
			fieldNames: this.fieldNames,
			loadFunction: wpcom.getDomainContactInformation.bind( wpcom ),
			validatorFunction: this.validate,
			onNewState: this.setFormState,
			onError: this.handleFormControllerError
		} );

		this.setState( { form: this.formStateController.getInitialState() } );
	},

	componentDidMount() {
		analytics.pageView.record( '/checkout/domain-registration-details', 'Checkout > Domain Registration Details' );
	},

	validate( fieldNames, onComplete ) {
		const domainNames = map( cartItems.getDomainRegistrations( this.props.cart ), 'meta' );

		wpcom.validateDomainContactInformation( fieldNames, domainNames, ( error, data ) => {
			const messages = data && data.messages || {};
			onComplete( error, messages );
		} );
	},

	setFormState( form ) {
		if ( ! this.isMounted() ) {
			return;
		}

		const errorMessages = formState.getErrorMessages( form );

		if ( errorMessages.length > 0 ) {
			const notice = notices.error( <ValidationErrorList messages={ errorMessages } /> );
			this.setState( { form, notice } );
		} else {
			if ( this.state.notice ) {
				notices.removeNotice( this.state.notice );
			}
			this.setState( { form } );
		}
	},

	handleFormControllerError( error ) {
		throw error;
	},

	handleChangeEvent( event ) {
		// Resets the state field every time the user selects a different country
		if ( event.target.name === 'country-code' ) {
			this.formStateController.handleFieldChange( {
				name: 'state',
				value: '',
				hideError: true
			} );
		}

		this.formStateController.handleFieldChange( {
			name: event.target.name,
			value: event.target.value
		} );
	},

	getNumberOfDomainRegistrations() {
		return cartItems.getDomainRegistrations( this.props.cart ).length;
	},

	getFieldProps( name ) {
		return {
			additionalClasses: 'checkout-field',
			value: formState.getFieldValue( this.state.form, name ),
			invalid: formState.isFieldInvalid( this.state.form, name ),
			disabled: formState.isFieldDisabled( this.state.form, name ),
			onChange: this.handleChangeEvent,
			eventFormName: 'Checkout Form'
		};
	},

	showFax() {
		return formState.getFieldValue( this.state.form, 'countryCode' ) === 'NL' && cartItems.hasNlTld( this.props.cart );
	},

	fields() {
		const countryCode = formState.getFieldValue( this.state.form, 'countryCode' ),
			fieldProps = ( name ) => this.getFieldProps( name ),
			textOnly = true;

		return (
			<div>
				<Input
					name="first-name"
					autofocus
					label={ this.translate( 'First Name', { textOnly } ) }
					{ ...fieldProps( 'first-name' ) }/>
				<Input name="last-name" label={ this.translate( 'Last Name', { textOnly } ) } { ...fieldProps( 'last-name' ) }/>

				<HiddenInput
					name="organization"
					label={ this.translate( 'Organization' ) }
					text={ this.translate(
						'Registering this domain for a company? + Add Organization Name',
						'Registering these domains for a company? + Add Organization Name',
						{
							context: 'Domain registration details page',
							comment: 'Count specifies the number of domain registrations',
							count: this.getNumberOfDomainRegistrations(),
							textOnly: true
						}
					) }/>

				<Input name="email" label={ this.translate( 'Email', { textOnly } ) } { ...fieldProps( 'email' ) }/>
				<Input name="phone" label={ this.translate( 'Phone', { textOnly } ) } { ...fieldProps( 'phone' ) }/>

				<CountrySelect
					name="country-code"
					label={ this.translate( 'County', { textOnly } ) }
					countriesList={ countriesList }
					{ ...fieldProps( 'country-code' ) }/>

				{ this.showFax() && <Input name="fax" label={ this.translate( 'Fax', { textOnly } ) } { ...( 'fax' ) }/> }
				<Input name="address-1" label={ this.translate( 'Address', { textOnly } ) } { ...fieldProps( 'address-1' ) }/>

				<Input
					name="address-2"
					label={ this.translate( 'Address Line 2', { textOnly } ) }
					text={ this.translate( '+ Add Address Line 2', { textOnly } ) }
					{ ...fieldProps( 'address-2' ) }/>

				<Input name="city" label={ this.translate( 'City', { textOnly } ) } { ...fieldProps( 'city' ) }/>

				<StateSelect
					name="state"
					label={ this.translate( 'State', { textOnly: true } ) }
					countryCode={ countryCode }
					statesList={ statesList }
					{ ...fieldProps( 'state' ) }/>

				<Input name="postal-code" label={ this.translate( 'Postal Code', { textOnly } ) } { ...fieldProps( 'postal-code' ) }/>

				<PrivacyProtection
					cart={ this.props.cart }
					countriesList= { countriesList }
					disabled={ formState.isSubmitButtonDisabled( this.state.form ) }
					fields={ this.state.form }
					onButtonSelect={ this.handlePrivacyDialogButtonSelect }
					onDialogClose={ this.handlePrivacyDialogClose }
					onDialogOpen={ this.handlePrivacyDialogOpen }
					onDialogSelect={ this.handlePrivacyDialogSelect }
					isDialogVisible={ this.state.isDialogVisible }
					productsList={ this.props.productsList } />
			</div>
		);
	},

	handlePrivacyDialogClose() {
		this.setState( { isDialogVisible: false } );
	},

	handlePrivacyDialogOpen() {
		this.setState( { isDialogVisible: true } );
	},

	content() {
		return (
			<form>
				{ this.fields() }
			</form>
		);
	},

	handlePrivacyDialogButtonSelect( options ) {
		this.formStateController.handleSubmit( ( hasErrors ) => {
			this.recordSubmit();

			if ( hasErrors ) {
				return;
			}

			if ( options.addPrivacy ) {
				this.finish( { addPrivacy: true } );
			} else if ( options.skipPrivacyDialog ) {
				this.finish( { addPrivacy: false } );
			} else {
				this.setState( { isDialogVisible: true } );
			}
		} );
	},

	recordSubmit() {
		analytics.tracks.recordEvent( 'calypso_contact_information_form_submit', {
			errors: formState.getErrorMessages( this.state.form )
		} );
	},

	handlePrivacyDialogSelect( options ) {
		this.formStateController.handleSubmit( ( hasErrors ) => {
			this.setState( { isDialogVisible: false } );
			this.recordSubmit();

			if ( hasErrors ) {
				return;
			}

			this.finish( options );
		} );
	},

	finish( options ) {
		if ( options.addPrivacy ) {
			upgradesActions.addPrivacyToAllDomains();
		} else {
			upgradesActions.removePrivacyFromAllDomains();
		}

		upgradesActions.setDomainDetails( formState.getAllFieldValues( this.state.form ) );
	},

	render() {
		const classSet = classNames( {
			'domain-details': true,
			selected: true
		} );

		return (
			<PaymentBox
				classSet={ classSet }
				title={ this.translate(
					'Domain Registration Details',
					{
						context: 'Domain registration details page',
						textOnly: true
					} ) }>
				{ this.content() }
			</PaymentBox>
		);
	}
} );
