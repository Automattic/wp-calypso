import config from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import EmptyContent from 'calypso/components/empty-content';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import wooDnaConfig from 'calypso/jetpack-connect/woo-dna-config';
import { isGravPoweredOAuth2Client, isWPJobManagerOAuth2Client } from 'calypso/lib/oauth2-clients';
import { login } from 'calypso/lib/paths';
import { recordTracksEventWithClientId as recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import {
	wasImmediateLoginAttempted,
	wasManualRenewalImmediateLoginAttempted,
} from 'calypso/state/immediate-login/selectors';
import { rebootAfterLogin } from 'calypso/state/login/actions';
import {
	fetchMagicLoginAuthenticate,
	showMagicLoginLinkExpiredPage,
} from 'calypso/state/login/magic-login/actions';
import { LINK_EXPIRED_PAGE } from 'calypso/state/login/magic-login/constants';
import {
	getRedirectToOriginal,
	getRedirectToSanitized,
	getTwoFactorNotificationSent,
	isTwoFactorEnabled,
} from 'calypso/state/login/selectors';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import getMagicLoginCurrentView from 'calypso/state/selectors/get-magic-login-current-view';
import getMagicLoginRequestAuthError from 'calypso/state/selectors/get-magic-login-request-auth-error';
import getMagicLoginRequestedAuthSuccessfully from 'calypso/state/selectors/get-magic-login-requested-auth-successfully';
import isFetchingMagicLoginAuth from 'calypso/state/selectors/is-fetching-magic-login-auth';
import EmailedLoginLinkExpired from './emailed-login-link-expired';

class HandleEmailedLinkForm extends Component {
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
		oauth2Client: PropTypes.object.isRequired,

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

		if ( ! props.emailAddress || ! props.token ) {
			this.props.showMagicLoginLinkExpiredPage();
		}
	}

	componentDidMount() {
		if (
			this.props.clientId === config( 'wpcom_signup_id' ) &&
			! this.props.isImmediateLoginAttempt &&
			! wooDnaConfig( this.props.initialQuery ).isWooDnaFlow()
		) {
			this.handleSubmit();
		}
	}

	handleSubmit = ( event ) => {
		if ( event ) {
			event.preventDefault();
		}

		this.setState( {
			hasSubmitted: true,
		} );

		// To customize the login experience for Gravatar-powered clients in the backend, e.g. SMS messages
		const flow = isGravPoweredOAuth2Client( this.props.oauth2Client )
			? this.props.oauth2Client.name
			: null;

		this.props.fetchMagicLoginAuthenticate( this.props.token, this.props.redirectToOriginal, flow );
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
					// If no notification is sent, the user is using the authenticator for 2FA by default
					twoFactorAuthType: twoFactorNotificationSent.replace( 'none', 'authenticator' ),
					redirectTo: redirectToSanitized,
				} )
			);
		}
	};

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
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
			oauth2Client,
		} = this.props;
		const isWooDna = wooDnaConfig( initialQuery ).isWooDnaFlow();
		const isGravPoweredClient = isGravPoweredOAuth2Client( oauth2Client );

		if ( isExpired ) {
			return <EmailedLoginLinkExpired isGravPoweredClient={ isGravPoweredClient } />;
		}

		let buttonLabel;
		if ( this.props.isImmediateLoginAttempt ) {
			buttonLabel = translate( 'Confirm Login to WordPress.com' );
		} else if ( isWooDna ) {
			buttonLabel = translate( 'Connect' );
		} else {
			buttonLabel = translate( 'Continue to WordPress.com' );
		}

		if ( isGravPoweredClient ) {
			buttonLabel = translate( 'Continue' );
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

		const illustration = isWooDna
			? '/calypso/images/illustrations/illustration-woo-magic-link.svg'
			: '';

		this.props.recordTracksEvent( 'calypso_login_email_link_handle_click_view' );

		if ( isGravPoweredClient ) {
			return (
				<div
					className={ classNames( 'grav-powered-magic-link', {
						'grav-powered-magic-link--wp-job-manager': isWPJobManagerOAuth2Client( oauth2Client ),
					} ) }
				>
					<img src={ oauth2Client.icon } width={ 27 } height={ 27 } alt={ oauth2Client.title } />
					<EmptyContent
						action={ this.state.hasSubmitted ? <LoadingEllipsis /> : action }
						illustration=""
						title=""
					/>
				</div>
			);
		}

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
	const redirectToOriginal = getRedirectToOriginal( state ) || '';
	const clientId = new URLSearchParams( redirectToOriginal.split( '?' )[ 1 ] ).get( 'client_id' );
	const oauth2Client = state.oauth2Clients?.clients?.[ clientId ] || {};

	return {
		redirectToOriginal,
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
		oauth2Client,
	};
};

const mapDispatch = {
	fetchMagicLoginAuthenticate,
	rebootAfterLogin,
	recordTracksEvent,
	showMagicLoginLinkExpiredPage,
};

export default connect( mapState, mapDispatch )( localize( HandleEmailedLinkForm ) );
