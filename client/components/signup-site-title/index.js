/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import LoggedOutForm from 'components/logged-out-form';

import formState from 'lib/form-state';
import FormFieldset from 'components/forms/form-fieldset';
import FormButton from 'components/forms/form-button';
import FormTextInput from 'components/forms/form-text-input';

import { getSiteTitle } from 'state/signup/steps/site-title/selectors';
import { setSiteTitle } from 'state/signup/steps/site-title/actions';

const SignupSiteTitle = React.createClass( {
	displayName: 'Signup Site Title',

	contextTypes: {
		store: React.PropTypes.object,
	},

	propTypes: {
		onSubmit: React.PropTypes.func.isRequired,
	},

	getInitialState() {
		return {
			form: {
				siteTitle: {
					value: this.props.siteTitle
				}
			}
		};
	},

	componentWillMount() {
		this.formStateController = new formState.Controller( {
			fieldNames: [ 'siteTitle' ],
			validatorFunction: () => {},
			onNewState: this.setFormState,
			onError: this.handleFormControllerError,
			hideFieldErrorsOnChange: true,
			initialState: this.state.form
		} );

		this.setState( { form: this.formStateController.getInitialState() } );
	},

	setFormState( state ) {
		this.setState( { form: state } );
	},

	handleChangeEvent( event ) {
		this.formStateController.handleFieldChange( {
			name: event.target.name,
			value: event.target.value
		} );
	},

	handleFormControllerError( error ) {
		if ( error ) {
			throw error;
		}
	},

	formFields() {
		return (
			<FormFieldset>
				<FormTextInput
					autoFocus={ true }
					autoCapitalize={ 'off' }
					className="signup-site-title__input"
					type="text"
					name="siteTitle"
					placeholder={ this.translate( 'Give your site a title' ) }
					value={ this.state.form.siteTitle.value }
					onChange={ this.handleChangeEvent }
				/>
				<FormButton className="signup-site-title__button">{ this.translate( 'Continue' ) }</FormButton>
			</FormFieldset>
		);
	},

	handleSubmit( event ) {
		event.preventDefault();

		const siteTitle = formState.getFieldValue( this.state.form, 'siteTitle' );
		this.props.onSubmit( siteTitle );
	},

	render() {
		return (
			<LoggedOutForm className="signup-site-title" onSubmit={ this.handleSubmit } noValidate>
				{ this.formFields() }
			</LoggedOutForm>
		);
	}
} );

export default connect(
	state => ( {
		siteTitle: getSiteTitle( state ),
	} ),
	{ setSiteTitle: setSiteTitle }
)( SignupSiteTitle );
