/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import {
	fetchMagicLoginRequestEmail,
	hideMagicLoginRequestNotice,
	setMagicLoginInputEmailAddress,
} from 'state/login/magic-login/actions';
import {
	getMagicLoginEmailAddressFormInput,
	getMagicLoginEmailAddressFormInputIsValid,
	isFetchingMagicLoginEmail,
	getMagicLoginRequestEmailError,
	getMagicLoginRequestedEmailSuccessfully,
} from 'state/selectors';

import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormTextInput from 'components/forms/form-text-input';
import LoggedOutForm from 'components/logged-out-form';
import Notice from 'components/notice';
import { localize } from 'i18n-calypso';

//@TODO move this to wp-login compoenent
import { getCurrentUser } from 'state/current-user/selectors';

class RequestLoginEmailForm extends React.Component {
	onEmailAddressFieldChange = event => {
		this.props.setMagicLoginInputEmailAddress( event.target.value );
	};

	onNoticeDismiss = () => {
		this.props.hideMagicLoginRequestNotice();
	}

	onSubmit = event => {
		event.preventDefault();
		this.props.fetchMagicLoginRequestEmail( this.props.emailAddress );
	};

	render() {
		const {
			currentUser,
			requestError,
			isFetching,
			isValidEmailAddress,
			emailRequested,
			translate,
		} = this.props;

		const submitEnabled = (
			isValidEmailAddress &&
			! isFetching &&
			! emailRequested &&
			! requestError
		);

		const errorText = typeof requestError === 'string' && requestError.length
			? requestError : translate( 'Unable to complete request' );

		return (
			<div>
				{ requestError &&
					<Notice
						duration={ 10000 }
						text={ errorText }
						className="magic-login__request-login-email-form-notice"
						showDismiss={ true }
						onDismissClick={ this.onNoticeDismiss }
						status="is-error" />
				}
				<LoggedOutForm onSubmit={ this.onSubmit }>
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
							disabled={ isFetching || emailRequested }
							name="emailAddress"
							placeholder="Email address"
							value={ this.props.emailAddress }
							onChange={ this.onEmailAddressFieldChange }
						/>

						<div className="magic-login__form-action">
							<FormButton primary disabled={ ! submitEnabled }>
								{ translate( 'Request Email' ) }
							</FormButton>
						</div>
					</FormFieldset>
				</LoggedOutForm>
			</div>
		);
	}
}

const mapState = state => {
	return {
		currentUser: getCurrentUser( state ),
		emailAddress: getMagicLoginEmailAddressFormInput( state ),
		isFetching: isFetchingMagicLoginEmail( state ),
		isValidEmailAddress: getMagicLoginEmailAddressFormInputIsValid( state ),
		requestError: getMagicLoginRequestEmailError( state ),
		emailRequested: getMagicLoginRequestedEmailSuccessfully( state ),
	};
};

const mapDispatch = {
	fetchMagicLoginRequestEmail,
	hideMagicLoginRequestNotice,
	setMagicLoginInputEmailAddress,
};

export default connect( mapState, mapDispatch )( localize( RequestLoginEmailForm ) );
