/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { noop } from 'lodash';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import FormLabel from 'components/forms/form-label';
import FormPasswordInput from 'components/forms/form-password-input';
import FormTextInput from 'components/forms/form-text-input';
import FormButton from 'components/forms/form-button';
import LoggedOutForm from 'components/logged-out-form';
import LoggedOutFormFooter from 'components/logged-out-form/footer';

class CredentialsForm extends Component {
	static propTypes = {
		submitButtonText: PropTypes.string.isRequired,
	};

	state = {
		notice: null,
		submitting: false,
		form: null,
		signedUp: false,
		validationInitialized: false,
	};

	getInitialFields() {
		return {
			username: '',
			password: '',
			submitting: false,
		};
	}

	sanitizeUsername( username ) {
		return username && username.replace( /[^a-zA-Z0-9]/g, '' ).toLowerCase();
	}

	sanitize = ( fields, onComplete ) => {
		const sanitizedUsername = this.sanitizeUsername( fields.username );

		if ( fields.username !== sanitizedUsername ) {
			onComplete( {
				username: sanitizedUsername,
			} );
		}
	};

	handleSubmit = event => {
		event.preventDefault();

		if ( this.state.submitting ) {
			return;
		}

		this.setState( { submitting: true } );
		// costruct url and call action
	};

	getChangeHandler = field => event => {
		this.setState( { [ field ]: event.target.value } );
	};

	formFields() {
		return (
			<div>
				<FormLabel htmlFor="username">{ this.props.translate( 'Username' ) }</FormLabel>
				<FormTextInput
					autoCapitalize="off"
					autoCorrect="off"
					className="credentials--form__input"
					disabled={ this.state.submitting }
					id="username"
					name="username"
					onChange={ this.getChangeHandler( 'username' ) }
					value={ this.state.username || '' }
				/>

				<FormLabel htmlFor="password">{ this.props.translate( 'Password' ) }</FormLabel>
				<FormPasswordInput
					className="credentials--form__input"
					disabled={ this.state.submitting }
					id="password"
					name="password"
					onChange={ this.getChangeHandler( 'password' ) }
					value={ this.state.password || '' }
				/>
			</div>
		);
	}

	formFooter() {
		return (
			<LoggedOutFormFooter>
				<FormButton
					className="credentials--form__submit"
					disabled={ ! this.state.username || ! this.state.password }
				>
					{ this.props.submitButtonText }
				</FormButton>
			</LoggedOutFormFooter>
		);
	}

	render() {
		return (
			<div className="credentials-form">
				<LoggedOutForm onSubmit={ this.handleSubmit } noValidate={ true }>
					{ this.formFields() }
					{ this.props.formFooter || this.formFooter() }
				</LoggedOutForm>

				{ this.props.footerLink }
			</div>
		);
	}
}

export default connect( null, {} )( localize( CredentialsForm ) );
