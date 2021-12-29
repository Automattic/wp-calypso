import { Popover } from '@automattic/components';
import { loadScript } from '@automattic/load-script';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { cloneElement, Component } from 'react';
import { connect } from 'react-redux';
import GoogleIcon from 'calypso/components/social-icons/google';
import { preventWidows } from 'calypso/lib/formatting';
import { localizeUrl } from 'calypso/lib/i18n-utils';
import { recordTracksEventWithClientId as recordTracksEvent } from 'calypso/state/analytics/actions';
import { isFormDisabled } from 'calypso/state/login/selectors';

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
		scope: 'https://www.googleapis.com/auth/userinfo.profile',
		fetchBasicProfile: true,
		onClick: noop,
	};

	state = {
		error: '',
		showError: false,
		errorRef: null,
		isDisabled: false,
		isLoading: false,
		isInitilized: false,
		isClicked: false,
	};

	constructor( props ) {
		super( props );

		this.initialized = null;

		this.handleClick = this.handleClick.bind( this );
		this.showError = this.showError.bind( this );
		this.hideError = this.hideError.bind( this );
	}

	componentDidMount() {
		this.initialize();
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
					this.setState( {
						isLoading: false,
						isDisabled: false,
						isInitilized: true,
					} );

					const googleAuth = gapi.auth2.getAuthInstance();
					const currentUser = googleAuth.currentUser.get();

					// handle social authentication response from a redirect-based oauth2 flow
					if ( currentUser && this.props.uxMode === 'redirect' ) {
						this.props.responseHandler( currentUser, false );
					}

					if ( this.state.isClicked ) {
						// Make sure that handleClick Call happens on the next tick so that the popup always launches.
						setTimeout( () => {
							this.handleClick( this.state.isClicked );
						}, 1 );
					}

					return gapi; // don't try to return googleAuth here, it's a thenable but not a valid promise
				} )
			)
			.catch( ( error ) => {
				this.initialized = null;

				this.setState( {
					isLoading: false,
				} );

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

	handleClick( event ) {
		event.preventDefault();

		if ( ! this.state.isInitilized && ! this.state.isClicked ) {
			this.setState( { isClicked: event, isLoading: true } );
			return;
		}

		this.props.onClick( event );

		if ( this.state.error ) {
			this.setState( {
				showError: ! this.state.showError,
				errorRef: event.currentTarget,
			} );

			return;
		}

		const { responseHandler } = this.props;

		this.setState( { isClicked: null } );

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

		this.setState( {
			showError: true,
			errorRef: event.currentTarget,
		} );
	}

	hideError() {
		this.setState( { showError: false } );
	}

	render() {
		const isDisabled = Boolean(
			this.state.isDisabled || this.props.isFormDisabled || this.state.error
		);
		const { isLoading } = this.state;

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
			<>
				{ customButton ? (
					customButton
				) : (
					<button
						className={ classNames( 'social-buttons__button button', {
							disabled: isDisabled && ! isLoading,
							loading: isLoading,
						} ) }
						onMouseOver={ this.showError }
						onFocus={ this.showError }
						onBlur={ this.hideError }
						onClick={ this.handleClick }
					>
						<GoogleIcon
							isDisabled={ isDisabled && ! isLoading }
							isLoading={ isLoading }
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
			</>
		);
	}
}

export default connect(
	( state ) => ( {
		isFormDisabled: isFormDisabled( state ),
	} ),
	{
		recordTracksEvent,
	}
)( localize( GoogleLoginButton ) );
