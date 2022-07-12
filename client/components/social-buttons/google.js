import config from '@automattic/calypso-config';
import { Popover } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { loadScript } from '@automattic/load-script';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { cloneElement, Component, Fragment } from 'react';
import { connect } from 'react-redux';
import GoogleIcon from 'calypso/components/social-icons/google';
import { preventWidows } from 'calypso/lib/formatting';
import { recordTracksEventWithClientId as recordTracksEvent } from 'calypso/state/analytics/actions';
import { isFormDisabled } from 'calypso/state/login/selectors';
import { getErrorFromHTTPError, postLoginRequest } from 'calypso/state/login/utils';
import { errorNotice } from 'calypso/state/notices/actions';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';

let auth2InitDone = false;

import './style.scss';

const noop = () => {};

class GoogleLoginButton extends Component {
	static propTypes = {
		clientId: PropTypes.string.isRequired,
		fetchBasicProfile: PropTypes.bool,
		isFormDisabled: PropTypes.bool,
		onClick: PropTypes.func,
		recordTracksEvent: PropTypes.func.isRequired,
		redirectUri: PropTypes.string,
		responseHandler: PropTypes.func.isRequired,
		scope: PropTypes.string,
		translate: PropTypes.func.isRequired,
		uxMode: PropTypes.string,
	};

	static defaultProps = {
		scope: config.isEnabled( 'migration/sign-in-with-google' )
			? 'openid profile email'
			: 'https://www.googleapis.com/auth/userinfo.profile',
		fetchBasicProfile: true,
		onClick: noop,
	};

	state = {
		error: '',
		showError: false,
		errorRef: null,
		eventTimeStamp: null,
		isDisabled: true,
	};

	constructor( props ) {
		super( props );

		this.initialized = null;

		this.handleClick = this.handleClick.bind( this );
		this.showError = this.showError.bind( this );
		this.hideError = this.hideError.bind( this );
	}

	componentDidMount() {
		if ( config.isEnabled( 'migration/sign-in-with-google' ) ) {
			if ( this.props.authCodeFromRedirect ) {
				this.handleAuthorizationCode( {
					auth_code: this.props.authCodeFromRedirect,
					redirect_uri: this.props.redirectUri,
				} );
			}

			this.initializeGoogleSignIn();

			return;
		}

		this.initialize();
	}

	async initializeGoogleSignIn() {
		const googleSignIn = await this.loadGoogleIdentityServicesAPI();

		this.client = googleSignIn.initCodeClient( {
			client_id: this.props.clientId,
			scope: this.props.scope,
			ux_mode: this.props.uxMode,
			redirect_uri: this.props.redirectUri,
			callback: ( response ) => {
				if ( response.error ) {
					this.props.recordTracksEvent( 'calypso_login_social_button_failure', {
						social_account_type: 'google',
						error_code: response.error,
					} );

					return;
				}

				this.handleAuthorizationCode( { auth_code: response.code } );
			},
		} );

		this.setState( { isDisabled: false } );
	}

	async loadGoogleIdentityServicesAPI() {
		if ( ! window.google?.accounts?.oauth2 ) {
			await loadScript( 'https://accounts.google.com/gsi/client' );
		}

		return window.google.accounts.oauth2;
	}

	async loadDependency() {
		if ( ! window.gapi ) {
			await loadScript( 'https://apis.google.com/js/platform.js' );
		}

		return window.gapi;
	}

	async initializeAuth2( gapi ) {
		if ( auth2InitDone ) {
			return;
		}

		await gapi.auth2.init( {
			fetch_basic_profile: this.props.fetchBasicProfile,
			client_id: this.props.clientId,
			scope: this.props.scope,
			ux_mode: this.props.uxMode,
			redirect_uri: this.props.redirectUri,
		} );
		auth2InitDone = true;
	}

	initialize() {
		if ( this.initialized ) {
			return this.initialized;
		}

		this.setState( { error: '' } );

		const { translate } = this.props;

		this.initialized = this.loadDependency()
			.then( ( gapi ) =>
				new Promise( ( resolve ) => gapi.load( 'auth2', resolve ) ).then( () => gapi )
			)
			.then( ( gapi ) =>
				this.initializeAuth2( gapi ).then( () => {
					this.setState( { isDisabled: false } );

					const googleAuth = gapi.auth2.getAuthInstance();
					const currentUser = googleAuth.currentUser.get();

					// handle social authentication response from a redirect-based oauth2 flow
					if ( currentUser && this.props.uxMode === 'redirect' ) {
						this.props.responseHandler( currentUser, false );
					}

					return gapi; // don't try to return googleAuth here, it's a thenable but not a valid promise
				} )
			)
			.catch( ( error ) => {
				this.initialized = null;

				if ( 'idpiframe_initialization_failed' === error.error ) {
					// This error is caused by 3rd party cookies being blocked.
					this.setState( {
						error: translate(
							'Please enable "third-party cookies" to connect your Google account. To learn how to do this, {{learnMoreLink}}click here{{/learnMoreLink}}.',
							{
								components: {
									learnMoreLink: (
										<a
											target="_blank"
											rel="noreferrer"
											href={ localizeUrl( 'https://wordpress.com/support/third-party-cookies/' ) }
										/>
									),
								},
							}
						),
					} );
				}

				return Promise.reject( error );
			} );

		return this.initialized;
	}

	async handleAuthorizationCode( { auth_code, redirect_uri } ) {
		let response;

		try {
			response = await postLoginRequest( 'exchange-social-auth-code', {
				service: 'google',
				auth_code,
				redirect_uri,
				client_id: config( 'wpcom_signup_id' ),
				client_secret: config( 'wpcom_signup_key' ),
			} );
		} catch ( httpError ) {
			const { code: error_code } = getErrorFromHTTPError( httpError );

			if ( error_code ) {
				this.props.recordTracksEvent( 'calypso_login_auth_code_exchange_failure', {
					social_account_type: 'google',
					error_code,
				} );
			}

			this.props.showErrorNotice(
				this.props.translate(
					'Something went wrong when trying to connect with Google. Please try again.'
				)
			);

			return;
		}

		const { access_token, id_token } = response.body.data;

		this.props.responseHandler( { access_token, id_token } );
	}

	handleClick( event ) {
		event.preventDefault();
		event.stopPropagation();

		if ( this.state.error && this.state.eventTimeStamp !== event.timeStamp ) {
			this.setState( {
				showError: ! this.state.showError,
				errorRef: event.currentTarget,
				eventTimeStamp: event.timeStamp,
			} );
		}

		if ( this.state.isDisabled ) {
			return;
		}

		this.props.onClick( event );

		if ( this.state.error ) {
			return;
		}

		if ( config.isEnabled( 'migration/sign-in-with-google' ) ) {
			this.client.requestCode();
			return;
		}

		const { responseHandler } = this.props;

		// Options are documented here:
		// https://developers.google.com/api-client-library/javascript/reference/referencedocs#gapiauth2signinoptions
		window.gapi.auth2
			.getAuthInstance()
			.signIn( { prompt: 'select_account' } )
			.then( responseHandler, ( error ) => {
				this.props.recordTracksEvent( 'calypso_login_social_button_failure', {
					social_account_type: 'google',
					error_code: error.error,
				} );
			} );
	}

	showError( event ) {
		if ( ! this.state.error ) {
			return;
		}

		event.stopPropagation();

		this.setState( {
			showError: true,
			errorRef: event.currentTarget,
			eventTimeStamp: event.timeStamp,
		} );
	}

	hideError() {
		this.setState( { showError: false } );
	}

	render() {
		const isDisabled = Boolean(
			this.state.isDisabled || this.props.isFormDisabled || this.state.error
		);

		const { children } = this.props;
		let customButton = null;

		if ( children ) {
			const childProps = {
				className: classNames( { disabled: isDisabled } ),
				onClick: this.handleClick,
				onMouseOver: this.showError,
				onFocus: this.showError,
				onMouseOut: this.hideError,
				onBlur: this.hideError,
			};

			customButton = cloneElement( children, childProps );
		}

		return (
			<Fragment>
				{ customButton ? (
					customButton
				) : (
					<button
						className={ classNames( 'social-buttons__button button', { disabled: isDisabled } ) }
						onClick={ this.handleClick }
						onMouseEnter={ this.showError }
						onMouseLeave={ this.hideError }
					>
						<GoogleIcon
							isDisabled={ isDisabled }
							width={ this.props.isReskinned ? 19 : 20 }
							height={ this.props.isReskinned ? 19 : 20 }
						/>

						<span className="social-buttons__service-name">
							{ this.props.translate( 'Continue with %(service)s', {
								args: { service: 'Google' },
								comment:
									'%(service)s is the name of a third-party authentication provider, e.g. "Google", "Facebook", "Apple" ...',
							} ) }
						</span>
					</button>
				) }
				<Popover
					id="social-buttons__error"
					className="social-buttons__error"
					isVisible={ this.state.showError }
					onClose={ this.hideError }
					position="top"
					context={ this.state.errorRef }
				>
					{ preventWidows( this.state.error ) }
				</Popover>
			</Fragment>
		);
	}
}

export default connect(
	( state ) => ( {
		isFormDisabled: isFormDisabled( state ),
		authCodeFromRedirect: getInitialQueryArguments( state ).code,
	} ),
	{
		recordTracksEvent,
		showErrorNotice: errorNotice,
	}
)( localize( GoogleLoginButton ) );
