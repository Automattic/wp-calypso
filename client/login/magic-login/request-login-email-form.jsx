/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import {
	fetchMagicLoginRequestEmail,
	hideMagicLoginRequestNotice,
} from 'state/login/magic-login/actions';
import {
	recordPageView,
} from 'state/analytics/actions';
import {
	isFetchingMagicLoginEmail,
	getMagicLoginCurrentView,
	getMagicLoginRequestEmailError,
	getMagicLoginRequestedEmailSuccessfully,
} from 'state/selectors';
import {
	CHECK_YOUR_EMAIL_PAGE,
} from 'state/login/magic-login/constants';

import EmailedLoginLinkSuccessfully from './emailed-login-link-successfully';
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormTextInput from 'components/forms/form-text-input';
import LoggedOutForm from 'components/logged-out-form';
import Notice from 'components/notice';
import { localize } from 'i18n-calypso';
import { getCurrentUser } from 'state/current-user/selectors';

class RequestLoginEmailForm extends React.Component {
	state = {};

	static propTypes = {
		// mapped to state
		currentUser: PropTypes.object,
		isFetching: PropTypes.bool,
		requestError: PropTypes.string,
		showCheckYourEmail: PropTypes.bool,
		emailRequested: PropTypes.bool,

		// mapped to dispatch
		fetchMagicLoginRequestEmail: PropTypes.func.isRequired,
		hideMagicLoginRequestNotice: PropTypes.func.isRequired,
		recordPageView: PropTypes.func.isRequired,
	};

	onEmailAddressFieldChange = event => {
		this.setState( {
			emailAddress: event.target.value,
		} );
	};

	onNoticeDismiss = () => {
		this.props.hideMagicLoginRequestNotice();
	}

	onSubmit = event => {
		event.preventDefault();
		this.props.fetchMagicLoginRequestEmail( this.state.emailAddress );
	};

	render() {
		const {
			currentUser,
			requestError,
			isFetching,
			emailRequested,
			showCheckYourEmail,
			translate,
		} = this.props;

		if ( showCheckYourEmail ) {
			this.props.recordPageView( '/log-in/link', 'Login > Link > Emailed' );
			return <EmailedLoginLinkSuccessfully emailAddress={ this.state.emailAddress } />;
		}

		const isValidEmailAddress = this.state.emailAddress &&
			this.state.emailAddress.match( /^.+@.+/ );

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
				<h1 className="magic-login__form-header">
					{ translate( 'Email me a login link.' ) }
				</h1>
				<p>
					{ translate( 'Get a link sent to the email address associated ' +
						'with your account to log in instantly without your password.' ) }
				</p>
				{ currentUser && currentUser.username &&
					<p>{
						translate( 'NOTE: You are already logged in as user: %(user)s', {
							args: {
								user: currentUser.username
							}
						} ) }</p>
				}
				<LoggedOutForm onSubmit={ this.onSubmit }>
					<FormFieldset>
						<FormTextInput
							autoCapitalize="off"
							autoFocus="true"
							disabled={ isFetching || emailRequested }
							name="emailAddress"
							placeholder={ translate( 'Email address' ) }
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
		isFetching: isFetchingMagicLoginEmail( state ),
		requestError: getMagicLoginRequestEmailError( state ),
		showCheckYourEmail: getMagicLoginCurrentView( state ) === CHECK_YOUR_EMAIL_PAGE,
		emailRequested: getMagicLoginRequestedEmailSuccessfully( state ),
	};
};

const mapDispatch = {
	fetchMagicLoginRequestEmail,
	hideMagicLoginRequestNotice,
	recordPageView,
};

export default connect( mapState, mapDispatch )( localize( RequestLoginEmailForm ) );
