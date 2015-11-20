/**
 * External dependencies
 */
var React = require( 'react' ),
	extend = require( 'lodash/object/assign' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var CountrySelect = require( 'my-sites/upgrades/components/form/country-select' ),
	StateSelect = require( 'my-sites/upgrades/components/form/state-select' ),
	Input = require( 'my-sites/upgrades/components/form/input' ),
	HiddenInput = require( 'my-sites/upgrades/components/form/hidden-input' ),
	PrivacyProtection = require( './privacy-protection' ),
	PaymentBox = require( './payment-box' ),
	cartItems = require( 'lib/cart-values' ).cartItems,
	hasNlTld = cartItems.hasNlTld,
	countriesList = require( 'lib/countries-list' ).forDomainRegistrations(),
	statesList = require( 'lib/states-list' ).forDomainRegistrations(),
	notices = require( 'notices' ),
	ValidationErrorList = require( 'notices/validation-error-list' ),
	wpcom = require( 'lib/wp' ).undocumented(),
	analytics = require( 'analytics' ),
	formState = require( 'lib/form-state' ),
	upgradesActions = require( 'lib/upgrades/actions' );

module.exports = React.createClass( {
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

	getInitialState: function() {
		return {
			form: null,
			isDialogVisible: false
		};
	},

	componentWillMount: function() {
		this.formStateController = formState.Controller( {
			fieldNames: this.fieldNames,
			loadFunction: wpcom.getDomainContactInformation.bind( wpcom ),
			validatorFunction: this.validate,
			onNewState: this.setFormState,
			onError: this.handleFormControllerError
		} );

		this.setState( { form: this.formStateController.getInitialState() } );
	},

	componentDidMount: function() {
		analytics.pageView.record( '/checkout/domain-registration-details', 'Checkout > Domain Registration Details' );
	},

	validate: function( fieldNames, onComplete ) {
		var cart = this.props.cart,
			domainRegistrations = cartItems.getDomainRegistrations( cart ),
			domainNames = domainRegistrations.map( function( domainRegistration ) {
				return domainRegistration.meta;
			} );

		wpcom.validateDomainContactInformation( fieldNames, domainNames, function( error, data ) {
			var messages = data && data.messages ? data.messages : {};
			onComplete( error, messages );
		} );
	},

	setFormState: function( state ) {
		if ( ! this.isMounted() ) {
			return;
		}

		const messages = formState.getErrorMessages( state );

		if ( messages.length > 0 ) {
			const notice = notices.error( <ValidationErrorList messages={ messages } /> );
			this.setState( {
				form: state,
				notice: notice
			} );
		} else {
			if ( this.state.notice ) {
				notices.removeNotice( this.state.notice );
			}
			this.setState( { form: state } );
		}
	},

	handleFormControllerError: function( error ) {
		throw error;
	},

	handleChangeEvent: function( event ) {
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

	getNumberOfDomainRegistrations: function() {
		var cart = this.props.cart,
			domainRegistrations = cartItems.getDomainRegistrations( cart );

		return domainRegistrations.length;
	},

	field: function( componentClass, props ) {
		var name = props.name;

		return React.createElement( componentClass, extend( {}, props, {
			additionalClasses: 'checkout-field',
			value: formState.getFieldValue( this.state.form, name ),
			invalid: formState.isFieldInvalid( this.state.form, name ),
			disabled: formState.isFieldDisabled( this.state.form, name ),
			onChange: this.handleChangeEvent,
			eventFormName: 'Checkout Form'
		} ) );
	},

	showFax: function() {
		var cart = this.props.cart,
			countryCode = formState.getFieldValue( this.state.form, 'countryCode' );

		return countryCode === 'NL' && hasNlTld( cart );
	},

	fields: function() {
		var countryCode = formState.getFieldValue( this.state.form, 'countryCode' );

		return (
			<div>
				{ this.field( Input, {
					name: 'first-name',
					autofocus: true,
					label: this.translate( 'First Name', { textOnly: true } )
				} ) }
				{ this.field( Input, {
					name: 'last-name',
					label: this.translate( 'Last Name', { textOnly: true } )
				} ) }
				{ this.field( HiddenInput, {
					name: 'organization',
					label: this.translate( 'Organization', { textOnly: true } ),
					text: this.translate(
						'Registering this domain for a company? + Add Organization Name',
						'Registering these domains for a company? + Add Organization Name',
						{
							context: 'Domain registration details page',
							comment: 'Count specifies the number of domain registrations',
							count: this.getNumberOfDomainRegistrations(),
							textOnly: true
						}
					)
				} ) }
				{ this.field( Input, {
					name: 'email',
					label: this.translate( 'Email', { textOnly: true } )
				} ) }
				{ this.field( Input, {
					name: 'phone',
					label: this.translate( 'Phone', { textOnly: true } )
				} ) }
				{ this.field( CountrySelect, {
					name: 'country-code',
					label: this.translate( 'Country', { textOnly: true } ),
					countriesList: countriesList
				} ) }
				{ this.showFax() ? this.field( Input, {
					name: 'fax',
					label: this.translate( 'Fax', { textOnly: true } )
				} ) : null }
				{ this.field( Input, {
					name: 'address-1',
					label: this.translate( 'Address', { textOnly: true } )
				} ) }
				{ this.field( HiddenInput, {
					name: 'address-2',
					label: this.translate( 'Address Line 2', { textOnly: true } ),
					text: this.translate( '+ Add Address Line 2', { textOnly: true } )
				} ) }
				{ this.field( Input, {
					name: 'city',
					label: this.translate( 'City', { textOnly: true } )
				} ) }
				{ this.field( StateSelect, {
					name: 'state',
					label: this.translate( 'State', { textOnly: true } ),
					countryCode: countryCode,
					statesList: statesList
				} ) }
				{ this.field( Input, {
					name: 'postal-code',
					label: this.translate( 'Postal Code', { textOnly: true } )
				} ) }
				<PrivacyProtection
					cart={ this.props.cart }
					countriesList= { countriesList }
					disabled={ formState.isSubmitButtonDisabled( this.state.form ) }
					fields={ this.state.form }
					onButtonSelect={ this.handleButtonSelect }
					onDialogClose={ this.handleDialogClose }
					onDialogOpen={ this.handleDialogOpen }
					onDialogSelect={ this.handleDialogSelect }
					isDialogVisible={ this.state.isDialogVisible }
					productsList={ this.props.productsList } />
			</div>
		);
	},

	handleDialogClose: function() {
		this.setState( { isDialogVisible: false } );
	},

	handleDialogOpen: function() {
		this.setState( { isDialogVisible: true } );
	},

	content: function() {
		return (
			<form>
				{ this.fields() }
			</form>
		);
	},

	handleButtonSelect: function( options ) {
		this.formStateController.handleSubmit( function( hasErrors ) {
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
		}.bind( this ) );
	},

	recordSubmit: function() {
		analytics.tracks.recordEvent( 'calypso_contact_information_form_submit', {
			errors: formState.getErrorMessages( this.state.form )
		} );
	},

	handleDialogSelect: function( options ) {
		this.formStateController.handleSubmit( function( hasErrors ) {
			this.setState( { isDialogVisible: false } );
			this.recordSubmit();

			if ( hasErrors ) {
				return;
			}

			this.finish( options );
		}.bind( this ) );
	},

	finish: function( options ) {
		if ( options.addPrivacy ) {
			upgradesActions.addPrivacyToAllDomains();
		} else {
			upgradesActions.removePrivacyFromAllDomains();
		}

		upgradesActions.setDomainDetails( formState.getAllFieldValues( this.state.form ) );
	},

	render: function() {
		var classSet = classNames( {
			'domain-details': true,
			selected: true
		} );

		return (
			<PaymentBox
				classSet={ classSet }
				title={ this.translate(
					'Domain Registration Details',
					'Domain Registration Details',
					{
						context: 'Domain registration details page',
						comment: 'Count specifies the number of domain registrations',
						count: this.getNumberOfDomainRegistrations(),
						textOnly: true
					} ) }>
				{ this.content() }
			</PaymentBox>
		);
	}
} );
