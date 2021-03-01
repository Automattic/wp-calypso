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
import EmptyContent from 'calypso/components/empty-content';
import EmailedLoginLinkExpired from './emailed-login-link-expired';
import config from '@automattic/calypso-config';
import { login } from 'calypso/lib/paths';
import { localize } from 'i18n-calypso';
import { LINK_EXPIRED_PAGE } from 'calypso/state/login/magic-login/constants';
import {
	fetchMagicLoginAuthenticate,
	showMagicLoginLinkExpiredPage,
} from 'calypso/state/login/magic-login/actions';
import { rebootAfterLogin } from 'calypso/state/login/actions';
import getMagicLoginCurrentView from 'calypso/state/selectors/get-magic-login-current-view';
import getMagicLoginRequestAuthError from 'calypso/state/selectors/get-magic-login-request-auth-error';
import getMagicLoginRequestedAuthSuccessfully from 'calypso/state/selectors/get-magic-login-requested-auth-successfully';
import isFetchingMagicLoginAuth from 'calypso/state/selectors/is-fetching-magic-login-auth';
import {
	getRedirectToOriginal,
	getRedirectToSanitized,
	getTwoFactorNotificationSent,
	isTwoFactorEnabled,
} from 'calypso/state/login/selectors';
import {
	wasImmediateLoginAttempted,
	wasManualRenewalImmediateLoginAttempted,
} from 'calypso/state/immediate-login/selectors';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { recordTracksEventWithClientId as recordTracksEvent } from 'calypso/state/analytics/actions';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import wooDnaConfig from 'calypso/jetpack-connect/woo-dna-config';

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
		initialQuery: PropTypes.object,

		// Connected action creators
		fetchMagicLoginAuthenticate: PropTypes.func.isRequired,
		rebootAfterLogin: PropTypes.func.isRequired,
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
			this.props.rebootAfterLogin( { magic_login: 1 } );
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
		const {
			currentUser,
			emailAddress,
			isExpired,
			isFetching,
			translate,
			initialQuery,
		} = this.props;
		const isWooDna = wooDnaConfig( initialQuery ).isWooDnaFlow();

		if ( isExpired ) {
			return <EmailedLoginLinkExpired />;
		}

		let buttonLabel;
		if ( this.props.isImmediateLoginAttempt ) {
			buttonLabel = translate( 'Confirm Login to WordPress.com' );
		} else if ( isWooDna ) {
			buttonLabel = translate( 'Connect' );
		} else {
			buttonLabel = translate( 'Continue to WordPress.com' );
		}

		const action = (
			<Button primary disabled={ this.state.hasSubmitted } onClick={ this.handleSubmit }>
				{ buttonLabel }
			</Button>
		);

		let title;
		if ( this.props.isManualRenewalImmediateLoginAttempt ) {
			title = translate( 'Update your payment details and renew your subscription' );
		} else if ( isWooDna ) {
			title = wooDnaConfig( initialQuery ).getServiceName();
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

		const illustration =
			'/calypso/images/illustrations/' +
			( isWooDna ? 'illustration-woo-magic-link.svg' : 'illustration-nosites.svg' );

		this.props.recordTracksEvent( 'calypso_login_email_link_handle_click_view' );

		return (
			<EmptyContent
				action={ action }
				className={ classNames( 'magic-login__handle-link', {
					'magic-login__is-fetching-auth': isFetching,
				} ) }
				illustration={ illustration }
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
		initialQuery: getInitialQueryArguments( state ),
	};
};

const mapDispatch = {
	fetchMagicLoginAuthenticate,
	rebootAfterLogin,
	recordTracksEvent,
	showMagicLoginLinkExpiredPage,
};

export default connect( mapState, mapDispatch )( localize( HandleEmailedLinkForm ) );
