/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import {
	camelCase,
	deburr,
	head,
	kebabCase,
	map,
	omit,
	reduce,
} from 'lodash';

/**
 * Internal dependencies
 */
import { CountrySelect, Input, HiddenInput } from 'my-sites/upgrades/components/form';
import { forDomainRegistrations as countriesListForDomainRegistrations } from 'lib/countries-list';
import analytics from 'lib/analytics';
import formState from 'lib/form-state';
import { addGoogleAppsRegistrationData } from 'lib/upgrades/actions';
import FormButton from 'components/forms/form-button';
import wpcom from 'lib/wp';

const countriesList = countriesListForDomainRegistrations();

class GoogleAppsDetailsForm extends Component {
	constructor( props, context ) {
		super( props, context );

		this.fieldNames = [
			'firstName',
			'lastName',
			'countryCode'
			'postalCode',
		];

		this.state = {
			form: null,
			isDialogVisible: false,
			submissionCount: 0,
		};
	}

	componentWillMount() {
		this.formStateController = formState.Controller( {
			fieldNames: this.fieldNames,
			loadFunction: wpcom.getDomainContactInformation.bind( wpcom ),
			sanitizerFunction: this.sanitize,
			validatorFunction: this.validate,
			onNewState: this.setFormState,
			onError: this.handleFormControllerError
		} );

		this.setState( { form: this.formStateController.getInitialState() } );
	}

	componentDidMount() {
		// do something different here for G Apps?
		analytics.pageView.record( '/checkout/domain-contact-information', 'Checkout > Google Apps Contact Information' );
	}

	sanitize = ( fieldValues, onComplete ) => {
		const sanitizedFieldValues = Object.assign( {}, fieldValues );
		this.fieldNames.forEach( ( fieldName ) => {
			if ( typeof fieldValues[ fieldName ] === 'string' ) {
				sanitizedFieldValues[ fieldName ] = deburr( fieldValues[ fieldName ].trim() );
				if ( fieldName === 'postalCode' ) {
					sanitizedFieldValues[ fieldName ] = sanitizedFieldValues[ fieldName ].toUpperCase();
				}
			}
		} );

		onComplete( sanitizedFieldValues );
	}

	validate = ( fieldValues, onComplete ) => {
		wpcom.validateGoogleAppsContactInformation( fieldValues, this.generateValidationHandler( onComplete ) );
	}

	generateValidationHandler( onComplete ) {
		return ( error, data ) => {
			const messages = data && data.messages || {};
			onComplete( error, messages );
		};
	}

	setFormState = ( form ) => {
		this.setState( { form } );
	}

	handleFormControllerError = ( error ) => {
		throw error;
	}

	handleChangeEvent = ( event ) => {
		this.formStateController.handleFieldChange( {
			name: event.target.name,
			value: event.target.value
		} );
	}

	getFieldProps( name ) {
		return {
			name,
			ref: name,
			additionalClasses: 'checkout-field',
			value: formState.getFieldValue( this.state.form, name ) || '',
			isError: formState.isFieldInvalid( this.state.form, name ),
			disabled: formState.isFieldDisabled( this.state.form, name ),
			onChange: this.handleChangeEvent,
			// The keys are mapped to snake_case when going to API and camelCase when the response is parsed and we are using
			// kebab-case for HTML, so instead of using different variations all over the place, this accepts kebab-case and
			// converts it to camelCase which is the format stored in the formState.
			errorMessage: ( formState.getFieldErrorMessages( this.state.form, camelCase( name ) ) || [] ).join( '\n' ),
			eventFormName: 'Checkout Form'
		};
	}

	renderSubmitButton() {
		return (
			<FormButton className="checkout__domain-details-form-submit-button" onClick={ this.handleSubmitButtonClick }>
				{ this.props.translate( 'Continue to Checkout' ) }
			</FormButton>
		);
	}

	renderNameFields() {
		return (
			<div>
				<Input
					autoFocus
					label={ this.props.translate( 'First Name' ) }
					{ ...this.getFieldProps( 'first-name' ) } />

				<Input label={ this.props.translate( 'Last Name' ) } { ...this.getFieldProps( 'last-name' ) } />
			</div>
		);
	}

	renderCountryField() {
		return (
			<CountrySelect
				label={ this.props.translate( 'Country' ) }
				countriesList={ countriesList }
				{ ...this.getFieldProps( 'country-code' ) } />
		);
	}

	renderPostalCodeField() {
		return (
			<Input label={ this.props.translate( 'Postal Code' ) } { ...this.getFieldProps( 'postal-code' ) } />
		);
	}

	focusFirstError() {
		this.refs[ kebabCase( head( map( formState.getInvalidFields( this.state.form ), 'name' ) ) ) ].focus();
	}

	handleSubmitButtonClick = ( event ) => {
		event.preventDefault();

		this.formStateController.handleSubmit( ( hasErrors ) => {
			this.recordSubmit();

			if ( hasErrors ) {
				this.focusFirstError();
				return;
			}

			this.finish();
		} );
	}

	recordSubmit() {
		const errors = formState.getErrorMessages( this.state.form ),
			tracksEventObject = reduce(
				formState.getErrorMessages( this.state.form ),
				( result, value, key ) => {
					result[ `error_${ key }` ] = value;
					return result;
				},
				{
					errors_count: errors && errors.length || 0,
					submission_count: this.state.submissionCount + 1
				}
			);

		analytics.tracks.recordEvent( 'calypso_contact_information_form_submit', tracksEventObject );
		this.setState( { submissionCount: this.state.submissionCount + 1 } );
	}

	finish( options = {} ) {
		const allFieldValues = Object.assign( {}, formState.getAllFieldValues( this.state.form ) );
		addGoogleAppsRegistrationData( allFieldValues );
	}

	render() {
		return (
			<form>
				{ this.renderNameFields() }
				{ this.renderCountryField() }
				{ this.renderPostalCodeField() }
				{ this.renderSubmitButton() }
			</form>
		);
	}
}

export default localize( GoogleAppsDetailsForm );
