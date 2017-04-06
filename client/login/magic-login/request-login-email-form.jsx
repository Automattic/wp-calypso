/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import {
	fetchRequestEmail,
	hideRequestForm,
	hideRequestNotice,
	setInputEmailAddress,
} from 'state/login/magic-login/actions';
import {
	emailAddressFormInput,
	emailAddressFormInputIsValid,
	isFetchingEmail,
	requestEmailError,
	requestedEmailSuccessfully,
} from 'state/login/magic-login/selectors';

import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormTextInput from 'components/forms/form-text-input';
import LoggedOutForm from 'components/logged-out-form';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import Notice from 'components/notice';
import { localize } from 'i18n-calypso';

//@TODO move this to wp-login compoenent
import { getCurrentUser } from 'state/current-user/selectors';

class RequestLoginEmailForm extends React.Component {
	onEmailAddressFieldChange = event => {
		this.props.setInputEmailAddress( event.target.value );
	};

	onSubmitBound = event => {
		event.preventDefault();
		this.props.onSubmit( this.props.emailAddress );
	};

	render() {
		const {
			currentUser,
			requestError,
			isFetching,
			isValidEmailAddress,
			onNoticeDismiss,
			onClickEnterPasswordInstead,
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
						onDismissClick={ onNoticeDismiss }
						status="is-error" />
				}
				<LoggedOutForm onSubmit={ this.onSubmitBound }>
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
				<LoggedOutFormLinks>
					<LoggedOutFormLinkItem onClick={ onClickEnterPasswordInstead }>
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
		emailAddress: emailAddressFormInput( state ),
		isFetching: isFetchingEmail( state ),
		isValidEmailAddress: emailAddressFormInputIsValid( state ),
		requestError: requestEmailError( state ),
		emailRequested: requestedEmailSuccessfully( state ),
	};
};

const mapDispatch = {
	onClickEnterPasswordInstead: hideRequestForm,
	onNoticeDismiss: hideRequestNotice,
	onSubmit: emailAddress => fetchRequestEmail( emailAddress ),
	setInputEmailAddress: emailAddress => setInputEmailAddress( emailAddress ),
};

export default connect( mapState, mapDispatch )( localize( RequestLoginEmailForm ) );
