/**
 * External dependencies
 */
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { isEmpty } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import EmailedLoginLinkExpired from './emailed-login-link-expired';
import Button from 'components/button';
import EmptyContent from 'components/empty-content';
import config from 'config';
import { login } from 'lib/paths';
import userFactory from 'lib/user';
import { recordTracksEvent } from 'state/analytics/actions';
import { getCurrentUser } from 'state/current-user/selectors';
import { fetchMagicLoginAuthenticate, showMagicLoginLinkExpiredPage } from 'state/login/magic-login/actions';
import { LINK_EXPIRED_PAGE } from 'state/login/magic-login/constants';
import { getTwoFactorNotificationSent, isTwoFactorEnabled } from 'state/login/selectors';
import { getMagicLoginCurrentView, getMagicLoginRequestAuthError, getMagicLoginRequestedAuthSuccessfully, isFetchingMagicLoginAuth } from 'state/selectors';

const user = userFactory();

class HandleEmailedLinkForm extends React.Component {
	static propTypes = {
		// Passed props
		clientId: PropTypes.string,
		emailAddress: PropTypes.string.isRequired,
		token: PropTypes.string.isRequired,
		tokenTime: PropTypes.string.isRequired,

		// Connected props
		authError: PropTypes.oneOfType( [
			PropTypes.string,
			PropTypes.number,
		] ),
		currentUser: PropTypes.object,
		isAuthenticated: PropTypes.bool,
		isExpired: PropTypes.bool,
		isFetching: PropTypes.bool,
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

		if (
			isEmpty( props.emailAddress ) ||
			isEmpty( props.token ) ||
			isEmpty( props.tokenTime )
		) {
			// Required props are really required :)
			this.props.showMagicLoginLinkExpiredPage();
		}
	}

	handleSubmit = ( event ) => {
		event.preventDefault();

		this.setState( {
			hasSubmitted: true,
		} );

		this.props.fetchMagicLoginAuthenticate( this.props.emailAddress, this.props.token, this.props.tokenTime );
	};

	// Lifted from `blocks/login`
	// @TODO move to `state/login/actions` & use both places
	handleValidToken = () => {
		if ( ! this.props.twoFactorEnabled ) {
			this.rebootAfterLogin();
		} else {
			page( login( {
				isNative: true,
				// If no notification is sent, the user is using the authenticator for 2FA by default
				twoFactorAuthType: this.props.twoFactorNotificationSent.replace( 'none', 'authenticator' )
			} ) );
		}
	};

	// Lifted from `blocks/login`
	// @TODO move to `state/login/actions` & use both places
	rebootAfterLogin = () => {
		const { redirectTo } = this.props;

		this.props.recordTracksEvent( 'calypso_login_success', {
			two_factor_enabled: this.props.twoFactorEnabled,
			magic_login: 1,
		} );

		// Redirects to / if no redirect url is available
		const url = redirectTo ? redirectTo : window.location.origin;

		// user data is persisted in localstorage at `lib/user/user` line 157
		// therefore we need to reset it before we redirect, otherwise we'll get
		// mixed data from old and new user
		user.clear();

		window.location.href = url;
	};

	componentWillUpdate( nextProps, nextState ) {
		const {
			authError,
			isAuthenticated,
			isFetching,
		} = nextProps;

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
		const {
			currentUser,
			emailAddress,
			isExpired,
			isFetching,
			translate,
		} = this.props;

		if ( isExpired ) {
			return <EmailedLoginLinkExpired />;
		}

		const action = (
			<Button primary disabled={ this.state.hasSubmitted } onClick={ this.handleSubmit }>
				{ translate( 'Finish Login' ) }
			</Button>
		);
		const title =
			this.props.clientId === config( 'wpcom_signup_id' )
				? translate( 'Continue to WordPress.com' )
				: translate( 'Continue to WordPress.com on your WordPress app' );
		const line = [
			translate(
				'Logging in as %(emailAddress)s', {
					args: {
						emailAddress,
					}
				}
			)
		];

		if ( currentUser && currentUser.username ) {
			line.push( <p>{
				translate( 'NOTE: You are already logged in as user: %(user)s', {
					args: {
						user: currentUser.username,
					}
				} ) }<br />
				{ translate( 'Continuing will switch users.' ) }
				</p> );
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

const mapState = state => {
	return {
		authError: getMagicLoginRequestAuthError( state ),
		currentUser: getCurrentUser( state ),
		isAuthenticated: getMagicLoginRequestedAuthSuccessfully( state ),
		isExpired: getMagicLoginCurrentView( state ) === LINK_EXPIRED_PAGE,
		isFetching: isFetchingMagicLoginAuth( state ),
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
