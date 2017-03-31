/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import emailValidator from 'email-validator';

/**
 * Internal dependencies
 */
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormTextInput from 'components/forms/form-text-input';
import LoggedOutForm from 'components/logged-out-form';
import LoggedOutFormFooter from 'components/logged-out-form/footer';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import Notice from 'components/notice';

import config from 'config';
import debugFactory from 'debug';
import formState from 'lib/form-state';
import { getCurrentUser } from 'state/current-user/selectors';
import { localize } from 'i18n-calypso';
import wpcom from 'lib/wp';

const debug = debugFactory( 'calypso:magic-login' );
const loginUrl = config( 'native_login_url' );

class RequestLoginEmailForm extends React.Component {
	state = {
		hasSubmitted: false,
		isEmailValid: false,
	};

	handleChangeEvent = event => {
		this.formStateController.handleFieldChange( {
			name: event.target.name,
			value: event.target.value
		} );
	};

	handleError = error => {
		const { translate } = this.props;
		this.setState( {
			errorMessage: error.message
				? error.message
				: translate( 'Could not request a login email. Please try again later.' ),
		} );
	};

	handleNoticeDismiss = () => {
		this.setState( {
			errorMessage: null,
			hasSubmitted: false,
		} );
	};

	handleSubmit = event => {
		event.preventDefault();

		const emailAddress = formState.getFieldValue( this.state.form, 'emailAddress' );
		debug( 'form submitted!', emailAddress );

		if ( ! emailAddress ) {
			return;
		}

		this.setState( {
			hasSubmitted: true,
		} );

		wpcom.undocumented().requestMagicLoginEmail( {
			email: emailAddress
		}, ( error, data ) => {
			if ( error ) {
				this.handleError( error );
				return;
			}
			debug( 'Request successful', data );
			window.location.replace( '/login/link-was-sent?email=' + encodeURIComponent( emailAddress ) );
		} );
	};

	setFormState = state => {
		debug( 'setFormState', state );
		this.setState( { form: state } );
	};

	componentWillMount() {
		this.formStateController = new formState.Controller( {
			fieldNames: [ 'emailAddress' ],
			debounceWait: 100,
			validatorFunction: this.validate.bind( this ),
			onNewState: this.setFormState,
			hideFieldErrorsOnChange: false,
			initialState: {
				emailAddress: {
					value: '',
				}
			}
		} );

		this.setFormState( this.formStateController.getInitialState() );
	}

	validate( formValues ) {
		const emailAddress = formValues.emailAddress;
		const isEmailValid = emailValidator.validate( emailAddress );
		debug( 'validate', emailAddress, isEmailValid );
		this.setState( {
			isEmailValid
		} );
	}

	render() {
		const { currentUser, translate } = this.props;
		return (
			<div>
				{ this.state.errorMessage &&
					<Notice
						duration={ 10000 }
						text={ this.state.errorMessage }
						className="auth__request-login-email-form-notice"
						showDismiss={ true }
						onDismissClick={ this.handleNoticeDismiss }
						status="is-error" />
				}
				<LoggedOutForm onSubmit={ this.handleSubmit }>
					<p>{
						translate( 'Get a link sent to the email address associated ' +
							'with your account to log in instantly without your password.' )
					}</p>
					{ currentUser && currentUser.username &&
						<p>{
							translate( 'NOTE: You are already logged in as user: %(user)s', {
								args: {
									user: currentUser.username
								}
							} ) }</p>
					}
					<FormFieldset>
						<FormTextInput
							autoCapitalize="off"
							autoFocus="true"
							name="emailAddress"
							placeholder="Email address"
							value={ this.state.form.emailAddress.value }
							onChange={ this.handleChangeEvent }
						/>

						<LoggedOutFormFooter>
							<FormButton primary disabled={ this.state.hasSubmitted || ! this.state.isEmailValid }>
								{ translate( 'Request Email' ) }
							</FormButton>
						</LoggedOutFormFooter>
					</FormFieldset>
				</LoggedOutForm>
				<LoggedOutFormLinks>
					<LoggedOutFormLinkItem href={ loginUrl }>
						{ translate( 'Enter a password instead' ) }
					</LoggedOutFormLinkItem>
				</LoggedOutFormLinks>
			</div>
		);
	}
}

const mapState = state => {
	return {
		currentUser: getCurrentUser( state ),
	};
};

export default connect( mapState )( localize( RequestLoginEmailForm ) );
