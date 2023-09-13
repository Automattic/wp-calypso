import config from '@automattic/calypso-config';
import { Popover } from '@automattic/components';
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

	state = {
		error: '',
		showError: false,
		errorRef: null,
		eventTimeStamp: null,
		isDisabled: true,
	};

	constructor( props ) {
		super( props );

		this.handleClick = this.handleClick.bind( this );
		this.showError = this.showError.bind( this );
		this.hideError = this.hideError.bind( this );
	}

	componentDidMount() {
		if ( this.props.authCodeFromRedirect ) {
			this.handleAuthorizationCode( {
				auth_code: this.props.authCodeFromRedirect,
				redirect_uri: this.props.redirectUri,
			} );
		}

		this.initializeGoogleSignIn();
	}

	async initializeGoogleSignIn() {
		const googleSignIn = await this.loadGoogleIdentityServicesAPI();

		if ( ! googleSignIn ) {
			this.setState( {
				error: this.props.translate( 'Something went wrong while trying to load Google sign-in.' ),
			} );

			return;
		}

		this.client = googleSignIn.initCodeClient( {
			client_id: this.props.clientId,
			scope: this.props.scope,
			ux_mode: this.props.uxMode,
			redirect_uri: this.props.redirectUri,
			callback: ( response ) => {
				if ( response.error ) {
					this.props.recordTracksEvent( 'calypso_social_button_failure', {
						social_account_type: 'google',
						starting_point: this.props.startingPoint,
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

		this.client.requestCode();
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
)( localize( GoogleSocialButton ) );
