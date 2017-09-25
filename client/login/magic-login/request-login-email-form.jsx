/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import EmailedLoginLinkSuccessfully from './emailed-login-link-successfully';
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormTextInput from 'components/forms/form-text-input';
import LoggedOutForm from 'components/logged-out-form';
import Notice from 'components/notice';
import { getCurrentUser } from 'state/current-user/selectors';
import { fetchMagicLoginRequestEmail, hideMagicLoginRequestNotice } from 'state/login/magic-login/actions';
import { CHECK_YOUR_EMAIL_PAGE } from 'state/login/magic-login/constants';
import { isFetchingMagicLoginEmail, getMagicLoginCurrentView, getMagicLoginRequestEmailError, getMagicLoginRequestedEmailSuccessfully } from 'state/selectors';

class RequestLoginEmailForm extends React.Component {
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
	};

	onEmailAddressFieldChange = event => {
		this.setState( {
			emailAddress: event.target.value,
		} );

		if ( this.props.requestError ) {
			this.props.hideMagicLoginRequestNotice();
		}
	};

	onNoticeDismiss = () => {
		this.props.hideMagicLoginRequestNotice();
	};

	onSubmit = event => {
		event.preventDefault();
		const emailAddress = this.getEmailAddressFromState();
		if ( ! emailAddress.length ) {
			return;
		}
		this.props.fetchMagicLoginRequestEmail( emailAddress );
	};

	getEmailAddressFromState() {
		return get( this, 'state.emailAddress', '' );
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

		const emailAddress = this.getEmailAddressFromState();

		if ( showCheckYourEmail ) {
			return <EmailedLoginLinkSuccessfully emailAddress={ emailAddress } />;
		}

		const submitEnabled = (
			emailAddress.length &&
			! isFetching &&
			! emailRequested &&
			! requestError
		);

		const errorText = typeof requestError === 'string' && requestError.length
			? requestError : translate( 'Unable to complete request' );

		return (
			<div>
				<h1 className="magic-login__form-header">
					{ translate( 'Email me a login link.' ) }
				</h1>
				{ requestError &&
					<Notice
						duration={ 10000 }
						text={ errorText }
						className="magic-login__request-login-email-form-notice"
						showDismiss={ true }
						onDismissClick={ this.onNoticeDismiss }
						status="is-error" />
				}
				{ currentUser && currentUser.username &&
					<p>{
						translate( 'NOTE: You are already logged in as user: %(user)s', {
							args: {
								user: currentUser.username
							}
						} ) }</p>
				}
				<LoggedOutForm onSubmit={ this.onSubmit }>
					<p>
						{ translate( 'Get a link sent to the email address associated ' +
							'with your account to log in instantly without your password.' ) }
					</p>
					<label htmlFor="emailAddress" className="magic-login__form-label">
						{ this.props.translate( 'Email Address' ) }
					</label>
					<FormFieldset className="magic-login__email-fields">
						<FormTextInput
							autoCapitalize="off"
							autoFocus="true"
							disabled={ isFetching || emailRequested }
							name="emailAddress"
							type="email"
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
};

export default connect( mapState, mapDispatch )( localize( RequestLoginEmailForm ) );
