/**
 * External dependencies
 */
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Popover from 'components/popover';
import GoogleIcon from 'components/social-icons/google';
import { preventWidows } from 'lib/formatting';
import { loadScript } from 'lib/load-script';
import { recordTracksEvent } from 'state/analytics/actions';
import { isFormDisabled } from 'state/login/selectors';

class GoogleLoginButton extends Component {
	static propTypes = {
		isFormDisabled: PropTypes.bool,
		clientId: PropTypes.string.isRequired,
		scope: PropTypes.string,
		fetchBasicProfile: PropTypes.bool,
		recordTracksEvent: PropTypes.func.isRequired,
		responseHandler: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		onClick: PropTypes.func,
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
		this.initialize();
	}

	loadDependency() {
		if ( window.gapi ) {
			return Promise.resolve( window.gapi );
		}

		return new Promise( resolve => {
			loadScript( 'https://apis.google.com/js/api.js', () => resolve( window.gapi ) );
		} );
	}

	initialize() {
		if ( this.initialized ) {
			return this.initialized;
		}

		this.setState( { error: '' } );

		const { translate } = this.props;

		this.initialized = this.loadDependency()
			.then( gapi => new Promise( resolve => gapi.load( 'client:auth2', resolve ) ).then( () => gapi ) )
			.then( gapi => gapi.client.init( {
				client_id: this.props.clientId,
				scope: this.props.scope,
				fetch_basic_profile: this.props.fetchBasicProfile,
			} )
			.then( () => {
				this.setState( { isDisabled: false } );
				return gapi; // don't try to return gapi.auth2.getAuthInstance() here, it has a `then` method
			} )
			).catch( error => {
				this.initialized = null;

				if ( 'idpiframe_initialization_failed' === error.error ) {
					// This error is caused by 3rd party cookies being blocked.
					this.setState( { error: translate( 'Please enable "third-party cookies" to connect your Google account.' ) } );
				}

				return Promise.reject( error );
			} );

		return this.initialized;
	}

	handleClick( event ) {
		event.preventDefault();

		if ( this.state.isDisabled ) {
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

		// Options are documented here:
		// https://developers.google.com/api-client-library/javascript/reference/referencedocs#gapiauth2signinoptions
		window.gapi.auth2.getAuthInstance().signIn( { prompt: 'select_account' } )
			.then(
				responseHandler,
				error => {
					this.props.recordTracksEvent( 'calypso_login_social_button_failure', {
						social_account_type: 'google',
						error_code: error.error
					} );
				}
			);
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
		const isDisabled = Boolean( this.state.isDisabled || this.props.isFormDisabled || this.state.error );

		const { children } = this.props;
		let customButton = null;

		if ( children ) {
			const childProps = {
				className: classNames( { disabled: isDisabled } ),
				onClick: this.handleClick,
				onMouseOver: this.showError,
				onMouseOut: this.hideError,
			};

			customButton = React.cloneElement( children, childProps );
		}

		return (
			<div className="social-buttons__button-container">
				{
					customButton
						? customButton
						: <button
							className={ classNames( 'social-buttons__button button', { disabled: isDisabled } ) }
							onMouseOver={ this.showError }
							onMouseOut={ this.hideError }
							onClick={ this.handleClick }
						>
							<GoogleIcon isDisabled={ isDisabled } />

							<span className="social-buttons__service-name">
								{ this.props.translate( 'Continue with %(service)s', {
									args: { service: 'Google' },
									comment: '%(service)s is the name of a Social Network, e.g. "Google", "Facebook", "Twitter" ...'
								} ) }
							</span>
						</button>
				}
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
			</div>
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
