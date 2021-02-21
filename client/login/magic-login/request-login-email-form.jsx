/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { defer, get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EmailedLoginLinkSuccessfully from './emailed-login-link-successfully';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import getMagicLoginCurrentView from 'calypso/state/selectors/get-magic-login-current-view';
import getMagicLoginRequestedEmailSuccessfully from 'calypso/state/selectors/get-magic-login-requested-email-successfully';
import getMagicLoginRequestEmailError from 'calypso/state/selectors/get-magic-login-request-email-error';
import isFetchingMagicLoginEmail from 'calypso/state/selectors/is-fetching-magic-login-email';
import LoggedOutForm from 'calypso/components/logged-out-form';
import Notice from 'calypso/components/notice';
import { CHECK_YOUR_EMAIL_PAGE } from 'calypso/state/login/magic-login/constants';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getRedirectToOriginal } from 'calypso/state/login/selectors';
import { hideMagicLoginRequestNotice } from 'calypso/state/login/magic-login/actions';
import { recordTracksEventWithClientId as recordTracksEvent } from 'calypso/state/analytics/actions';
import { sendEmailLogin } from 'calypso/state/auth/actions';

class RequestLoginEmailForm extends React.Component {
	static propTypes = {
		// mapped to state
		currentUser: PropTypes.object,
		emailRequested: PropTypes.bool,
		isFetching: PropTypes.bool,
		redirectTo: PropTypes.string,
		requestError: PropTypes.string,
		showCheckYourEmail: PropTypes.bool,
		userEmail: PropTypes.string,

		// mapped to dispatch
		sendEmailLogin: PropTypes.func.isRequired,
		hideMagicLoginRequestNotice: PropTypes.func.isRequired,
	};

	state = {
		usernameOrEmail: this.props.userEmail || '',
	};

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( ! this.props.requestError && nextProps.requestError ) {
			defer( () => this.usernameOrEmail && this.usernameOrEmail.focus() );
		}
	}

	onUsernameOrEmailFieldChange = ( event ) => {
		this.setState( {
			usernameOrEmail: event.target.value,
		} );

		if ( this.props.requestError ) {
			this.props.hideMagicLoginRequestNotice();
		}
	};

	saveUsernameOrEmailRef = ( input ) => {
		this.usernameOrEmail = input;
	};

	onNoticeDismiss = () => {
		this.props.hideMagicLoginRequestNotice();
	};

	onSubmit = ( event ) => {
		event.preventDefault();

		const usernameOrEmail = this.getUsernameOrEmailFromState();

		if ( ! usernameOrEmail.length ) {
			return;
		}

		this.props.sendEmailLogin( usernameOrEmail, {
			redirectTo: this.props.redirectTo,
			requestLoginEmailFormFlow: true,
		} );
	};

	getUsernameOrEmailFromState() {
		return get( this, 'state.usernameOrEmail', '' );
	}

	render() {
		const {
			currentUser,
			requestError,
			isFetching,
			emailRequested,
			showCheckYourEmail,
			translate,
		} = this.props;

		const usernameOrEmail = this.getUsernameOrEmailFromState();

		if ( showCheckYourEmail ) {
			const emailAddress = usernameOrEmail.indexOf( '@' ) > 0 ? usernameOrEmail : null;
			return <EmailedLoginLinkSuccessfully emailAddress={ emailAddress } />;
		}

		const submitEnabled =
			usernameOrEmail.length && ! isFetching && ! emailRequested && ! requestError;

		const errorText =
			typeof requestError === 'string' && requestError.length
				? requestError
				: translate( 'Unable to complete request' );

		return (
			<div className="magic-login__form">
				<h1 className="magic-login__form-header">{ translate( 'Email me a login link.' ) }</h1>
				{ requestError && (
					<Notice
						duration={ 10000 }
						text={ errorText }
						className="magic-login__request-login-email-form-notice"
						showDismiss={ true }
						onDismissClick={ this.onNoticeDismiss }
						status="is-error"
					/>
				) }
				{ currentUser && currentUser.username && (
					<p>
						{ translate( 'NOTE: You are already logged in as user: %(user)s', {
							args: {
								user: currentUser.username,
							},
						} ) }
					</p>
				) }
				<LoggedOutForm onSubmit={ this.onSubmit }>
					<p>
						{ translate(
							'Get a link sent to the email address associated ' +
								'with your account to log in instantly without your password.'
						) }
					</p>
					<FormLabel htmlFor="usernameOrEmail">
						{ this.props.translate( 'Email Address' ) }
					</FormLabel>
					<FormFieldset className="magic-login__email-fields">
						<FormTextInput
							autoCapitalize="off"
							autoFocus // eslint-disable-line jsx-a11y/no-autofocus
							disabled={ isFetching || emailRequested }
							value={ usernameOrEmail }
							name="usernameOrEmail"
							ref={ this.saveUsernameOrEmailRef }
							onChange={ this.onUsernameOrEmailFieldChange }
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

const mapState = ( state ) => {
	return {
		currentUser: getCurrentUser( state ),
		isFetching: isFetchingMagicLoginEmail( state ),
		redirectTo: getRedirectToOriginal( state ),
		requestError: getMagicLoginRequestEmailError( state ),
		showCheckYourEmail: getMagicLoginCurrentView( state ) === CHECK_YOUR_EMAIL_PAGE,
		emailRequested: getMagicLoginRequestedEmailSuccessfully( state ),
		userEmail:
			getInitialQueryArguments( state ).email_address ||
			getCurrentQueryArguments( state ).email_address,
	};
};

const mapDispatch = {
	sendEmailLogin,
	hideMagicLoginRequestNotice,
	recordTracksEvent,
};

export default connect( mapState, mapDispatch )( localize( RequestLoginEmailForm ) );
