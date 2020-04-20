/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import page from 'page';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import EmptyContent from 'components/empty-content';
import EmailedLoginLinkExpired from './emailed-login-link-expired';
import config from 'config';
import userFactory from 'lib/user';
import { login } from 'lib/paths';
import { localize } from 'i18n-calypso';
import { LINK_EXPIRED_PAGE } from 'state/login/magic-login/constants';
import {
	fetchMagicLoginAuthenticate,
	showMagicLoginLinkExpiredPage,
} from 'state/login/magic-login/actions';
import getMagicLoginCurrentView from 'state/selectors/get-magic-login-current-view';
import getMagicLoginRequestAuthError from 'state/selectors/get-magic-login-request-auth-error';
import getMagicLoginRequestedAuthSuccessfully from 'state/selectors/get-magic-login-requested-auth-successfully';
import isFetchingMagicLoginAuth from 'state/selectors/is-fetching-magic-login-auth';
import {
	getRedirectToOriginal,
	getRedirectToSanitized,
	getTwoFactorNotificationSent,
	isTwoFactorEnabled,
} from 'state/login/selectors';
import {
	wasImmediateLoginAttempted,
	wasManualRenewalImmediateLoginAttempted,
} from 'state/immediate-login/selectors';
import { getCurrentUser } from 'state/current-user/selectors';
import { recordTracksEventWithClientId as recordTracksEvent } from 'state/analytics/actions';

const user = userFactory();

class HandleEmailedLinkForm extends React.Component {
	static propTypes = {
		// Passed props
		clientId: PropTypes.string,
		emailAddress: PropTypes.string.isRequired,
		token: PropTypes.string.isRequired,

		// Connected props
		authError: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ),
		currentUser: PropTypes.object,
		isAuthenticated: PropTypes.bool,
		isExpired: PropTypes.bool,
		isFetching: PropTypes.bool,
		isImmediateLoginAttempt: PropTypes.bool,
		isManualRenewalImmediateLoginAttempt: PropTypes.bool,
		redirectToOriginal: PropTypes.string,
		redirectToSanitized: PropTypes.string,
		twoFactorEnabled: PropTypes.bool,
		twoFactorNotificationSent: PropTypes.string,

		// Connected action creators
		fetchMagicLoginAuthenticate: PropTypes.func.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		showMagicLoginLinkExpiredPage: PropTypes.func.isRequired,
	};

	state = {
		hasSubmitted: false,
	};

	constructor( props ) {
		super( props );

		if ( isEmpty( props.emailAddress ) || isEmpty( props.token ) ) {
			this.props.showMagicLoginLinkExpiredPage();
		}
	}

	handleSubmit = ( event ) => {
		event.preventDefault();

		this.setState( {
			hasSubmitted: true,
		} );

		this.props.fetchMagicLoginAuthenticate( this.props.token, this.props.redirectToOriginal );
	};

	// Lifted from `blocks/login`
	// @TODO move to `state/login/actions` & use both places
	handleValidToken = () => {
		const { redirectToSanitized, twoFactorEnabled, twoFactorNotificationSent } = this.props;

		if ( ! twoFactorEnabled ) {
			this.rebootAfterLogin();
		} else {
			page(
				login( {
					isNative: true,
					// If no notification is sent, the user is using the authenticator for 2FA by default
					twoFactorAuthType: twoFactorNotificationSent.replace( 'none', 'authenticator' ),
					redirectTo: redirectToSanitized,
				} )
			);
		}
	};

	// Lifted from `blocks/login`
	// @TODO move to `state/login/actions` & use both places
	rebootAfterLogin = () => {
		const { redirectToSanitized, twoFactorEnabled } = this.props;

		this.props.recordTracksEvent( 'calypso_login_success', {
			two_factor_enabled: twoFactorEnabled,
			magic_login: 1,
		} );

		// Redirects to / if no redirect url is available
		const url = redirectToSanitized || '/';

		// user data is persisted in localstorage at `lib/user/user` line 157
		// therefore we need to reset it before we redirect, otherwise we'll get
		// mixed data from old and new user
		user.clear().then( () => {
			window.location.href = url;
		} );
	};

	UNSAFE_componentWillUpdate( nextProps, nextState ) {
		const { authError, isAuthenticated, isFetching } = nextProps;

		if ( ! nextState.hasSubmitted || isFetching ) {
			// Don't do anything here unless the browser has received the `POST` response
			return;
		}

		if ( authError || ! isAuthenticated ) {
			// @TODO if this is a 5XX, or timeout, show an error...?
			this.props.showMagicLoginLinkExpiredPage();
			return;
		}

		this.handleValidToken();
	}

	render() {
		const { currentUser, emailAddress, isExpired, isFetching, translate } = this.props;

		if ( isExpired ) {
			return <EmailedLoginLinkExpired />;
		}

		const action = (
			<Button primary disabled={ this.state.hasSubmitted } onClick={ this.handleSubmit }>
				{ this.props.isImmediateLoginAttempt
					? translate( 'Confirm Login to WordPress.com' )
					: translate( 'Continue to WordPress.com' ) }
			</Button>
		);

		let title;
		if ( this.props.isManualRenewalImmediateLoginAttempt ) {
			title = translate( 'Update your payment details and renew your subscription' );
		} else {
			title =
				this.props.clientId === config( 'wpcom_signup_id' )
					? translate( 'Welcome back!' )
					: translate( 'Continue to WordPress.com on your WordPress app' );
		}

		const line = [
			translate( 'Logging in as %(emailAddress)s', {
				args: {
					emailAddress,
				},
			} ),
		];

		if ( currentUser && currentUser.username ) {
			line.push(
				<p>
					{ translate( 'NOTE: You are already logged in as user: %(user)s', {
						args: {
							user: currentUser.username,
						},
					} ) }
					<br />
					{ translate( 'Continuing will switch users.' ) }
				</p>
			);
		}

		this.props.recordTracksEvent( 'calypso_login_email_link_handle_click_view' );

		return (
			<EmptyContent
				action={ action }
				className={ classNames( 'magic-login__handle-link', {
					'magic-login__is-fetching-auth': isFetching,
				} ) }
				illustration={ '/calypso/images/illustrations/illustration-nosites.svg' }
				illustrationWidth={ 500 }
				line={ line }
				title={ title }
			/>
		);
	}
}

const mapState = ( state ) => {
	return {
		redirectToOriginal: getRedirectToOriginal( state ),
		redirectToSanitized: getRedirectToSanitized( state ),
		authError: getMagicLoginRequestAuthError( state ),
		currentUser: getCurrentUser( state ),
		isAuthenticated: getMagicLoginRequestedAuthSuccessfully( state ),
		isExpired: getMagicLoginCurrentView( state ) === LINK_EXPIRED_PAGE,
		isFetching: isFetchingMagicLoginAuth( state ),
		isImmediateLoginAttempt: wasImmediateLoginAttempted( state ),
		isManualRenewalImmediateLoginAttempt: wasManualRenewalImmediateLoginAttempted( state ),
		twoFactorEnabled: isTwoFactorEnabled( state ),
		twoFactorNotificationSent: getTwoFactorNotificationSent( state ),
	};
};

const mapDispatch = {
	fetchMagicLoginAuthenticate,
	recordTracksEvent,
	showMagicLoginLinkExpiredPage,
};

export default connect( mapState, mapDispatch )( localize( HandleEmailedLinkForm ) );
