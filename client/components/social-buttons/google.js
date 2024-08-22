import config from '@automattic/calypso-config';
import { loadScript } from '@automattic/load-script';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { cloneElement, Component, Fragment } from 'react';
import { connect } from 'react-redux';
import wpcomRequest from 'wpcom-proxy-request';
import GoogleIcon from 'calypso/components/social-icons/google';
import { recordTracksEventWithClientId as recordTracksEvent } from 'calypso/state/analytics/actions';
import { isFormDisabled } from 'calypso/state/login/selectors';
import { getErrorFromHTTPError, postLoginRequest } from 'calypso/state/login/utils';
import { errorNotice } from 'calypso/state/notices/actions';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';

import './style.scss';

const noop = () => {};

class GoogleSocialButton extends Component {
	static propTypes = {
		clientId: PropTypes.string.isRequired,
		fetchBasicProfile: PropTypes.bool,
		isFormDisabled: PropTypes.bool,
		onClick: PropTypes.func,
		recordTracksEvent: PropTypes.func.isRequired,
		redirectUri: PropTypes.string,
		responseHandler: PropTypes.func.isRequired,
		scope: PropTypes.string,
		startingPoint: PropTypes.string.isRequired,
		translate: PropTypes.func.isRequired,
		uxMode: PropTypes.string,
	};

	static defaultProps = {
		scope: 'openid profile email',
		fetchBasicProfile: true,
		onClick: noop,
	};

	constructor( props ) {
		super( props );

		this.handleClick = this.handleClick.bind( this );
	}

	componentDidMount() {
		if ( this.props.authCodeFromRedirect && this.props.serviceFromRedirect !== 'github' ) {
			this.handleAuthorizationCode( {
				auth_code: this.props.authCodeFromRedirect,
				redirect_uri: this.props.redirectUri,
				state: this.props.state,
			} );
		}
	}

	async initializeGoogleSignIn( state ) {
		const googleSignIn = await this.loadGoogleIdentityServicesAPI();

		if ( ! googleSignIn ) {
			this.props.recordTracksEvent( 'calypso_social_button_failure', {
				social_account_type: 'google',
				starting_point: this.props.startingPoint,
				error_code: 'google_identity_services_api_not_loaded',
			} );

			this.props.showErrorNotice(
				this.props.translate( 'Something went wrong while trying to load Google sign-in.' )
			);

			return;
		}

		this.client = googleSignIn.initCodeClient( {
			client_id: this.props.clientId,
			scope: this.props.scope,
			ux_mode: this.props.uxMode,
			redirect_uri: this.props.redirectUri,
			state: state,
			callback: ( response ) => {
				if ( response.error ) {
					this.props.recordTracksEvent( 'calypso_social_button_failure', {
						social_account_type: 'google',
						starting_point: this.props.startingPoint,
						error_code: response.error,
					} );

					return;
				}

				this.handleAuthorizationCode( { auth_code: response.code, state: response.state } );
			},
		} );
	}

	async loadGoogleIdentityServicesAPI() {
		if ( ! window?.google?.accounts?.oauth2 ) {
			try {
				await loadScript( 'https://accounts.google.com/gsi/client' );
			} catch {
				// It's safe to ignore loading errors because if Google is blocked in some way the the button will be disabled.
				return null;
			}
		}

		return window?.google?.accounts?.oauth2 ?? null;
	}

	async handleAuthorizationCode( { auth_code, redirect_uri, state } ) {
		let response;
		try {
			response = await postLoginRequest( 'exchange-social-auth-code', {
				service: 'google',
				auth_code,
				redirect_uri,
				client_id: config( 'wpcom_signup_id' ),
				client_secret: config( 'wpcom_signup_key' ),
				state,
			} );
		} catch ( httpError ) {
			const { code: error_code } = getErrorFromHTTPError( httpError );

			if ( error_code ) {
				this.props.recordTracksEvent( 'calypso_social_button_auth_code_exchange_failure', {
					social_account_type: 'google',
					starting_point: this.props.startingPoint,
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

		this.props.recordTracksEvent( 'calypso_social_button_auth_code_exchange_success', {
			social_account_type: 'google',
			starting_point: this.props.startingPoint,
		} );

		const { access_token, id_token } = response.body.data;

		this.props.responseHandler( { access_token, id_token } );
	}

	async fetchNonceAndInitializeGoogleSignIn() {
		try {
			const response = await wpcomRequest( {
				path: '/generate-authorization-nonce',
				apiNamespace: 'wpcom/v2',
				apiVersion: '2',
				method: 'GET',
			} );
			const state = response.nonce;

			await this.initializeGoogleSignIn( state );
		} catch ( error ) {
			this.props.showErrorNotice(
				this.props.translate(
					'Error fetching nonce or initializing Google sign-in. Please try again.'
				)
			);
		}
	}

	async handleClick( event ) {
		event.preventDefault();
		event.stopPropagation();

		await this.fetchNonceAndInitializeGoogleSignIn();
		this.props.onClick( event );

		this.client?.requestCode();
	}

	render() {
		const isDisabled = Boolean( this.props.isFormDisabled );

		const { children } = this.props;
		let customButton = null;

		if ( children ) {
			const childProps = {
				className: clsx( { disabled: isDisabled } ),
				onClick: this.handleClick,
			};

			customButton = cloneElement( children, childProps );
		}

		return (
			<Fragment>
				{ customButton ? (
					customButton
				) : (
					<button
						className={ clsx( 'social-buttons__button button google', { disabled: isDisabled } ) }
						onClick={ this.handleClick }
						disabled={ isDisabled }
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
			</Fragment>
		);
	}
}

export default connect(
	( state ) => ( {
		isFormDisabled: isFormDisabled( state ),
		authCodeFromRedirect: getInitialQueryArguments( state ).code,
		serviceFromRedirect: getInitialQueryArguments( state ).service,
		state: getInitialQueryArguments( state ).state,
	} ),
	{
		recordTracksEvent,
		showErrorNotice: errorNotice,
	}
)( localize( GoogleSocialButton ) );
