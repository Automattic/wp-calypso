/**
 * External dependencies
 */
import config from 'config';
import classNames from 'classnames';
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';
import { loadScript } from '@automattic/load-script';

/**
 * Internal dependencies
 */
import { isFormDisabled } from 'state/login/selectors';
import requestExternalAccess from 'lib/sharing';

/**
 * Style dependencies
 */
import './style.scss';
import AppleIcon from 'components/social-icons/apple';

const appleClientUrl =
	'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
const connectUrlPopupFLow =
	'https://public-api.wordpress.com/connect/?magic=keyring&service=apple&action=request&for=connect';

class AppleLoginButton extends Component {
	static propTypes = {
		clientId: PropTypes.string.isRequired,
		isFormDisabled: PropTypes.bool,
		redirectUri: PropTypes.string,
		responseHandler: PropTypes.func.isRequired,
		scope: PropTypes.string,
		uxMode: PropTypes.oneOf( [ 'redirect', 'popup' ] ),
		socialServiceResponse: PropTypes.object,
	};

	static defaultProps = {
		onClick: noop,
		scope: 'name email',
		uxMode: 'popup',
	};

	appleClient = null;

	componentDidMount() {
		if ( ! config.isEnabled( 'sign-in-with-apple' ) ) {
			return;
		}

		if ( this.props.uxMode === 'redirect' ) {
			this.props.socialServiceResponse &&
				this.handleSocialResponseFromRedirect( this.props.socialServiceResponse );
			this.loadAppleClient();
		}
	}

	handleSocialResponseFromRedirect( socialServiceResponse ) {
		if ( socialServiceResponse.client_id !== config( 'apple_oauth_client_id' ) ) {
			return;
		}

		const storedOauth2State = window.sessionStorage.getItem( 'siwa_state' );
		window.sessionStorage.removeItem( 'siwa_state' );

		if ( socialServiceResponse.state !== storedOauth2State ) {
			return;
		}

		const user = {
			email: socialServiceResponse.user_email,
			name: socialServiceResponse.user_name,
		};
		this.props.responseHandler( {
			id_token: socialServiceResponse.id_token,
			user: user,
		} );
	}

	async loadAppleClient() {
		if ( this.appleClient ) {
			return this.appleClient;
		}

		if ( ! window.AppleID ) {
			await loadScript( appleClientUrl );
		}

		const oauth2State = String( Math.floor( Math.random() * 10e9 ) );
		window.sessionStorage.setItem( 'siwa_state', oauth2State );

		window.AppleID.auth.init( {
			clientId: this.props.clientId,
			scope: this.props.scope,
			redirectURI: this.props.redirectUri,
			state: oauth2State,
		} );

		this.appleClient = window.AppleID;

		return this.appleClient;
	}

	handleClick = ( event ) => {
		event.preventDefault();

		if ( this.props.onClick ) {
			this.props.onClick( event );
		}

		if ( this.props.uxMode === 'popup' ) {
			requestExternalAccess( connectUrlPopupFLow, this.props.responseHandler );
			return;
		}

		if ( this.props.uxMode === 'redirect' ) {
			this.loadAppleClient().then( ( AppleID ) => AppleID.auth.signIn() );
			return;
		}
	};

	render() {
		if ( ! config.isEnabled( 'sign-in-with-apple' ) ) {
			return null;
		}

		const { children, isFormDisabled: isDisabled } = this.props;
		let customButton = null;

		if ( children ) {
			const childProps = {
				className: classNames( { disabled: isDisabled } ),
				onClick: this.handleClick,
			};

			customButton = React.cloneElement( children, childProps );
		}

		return (
			<Fragment>
				{ customButton ? (
					customButton
				) : (
					<button
						className={ classNames( 'social-buttons__button button', { disabled: isDisabled } ) }
						onClick={ this.handleClick }
					>
						<AppleIcon isDisabled={ isDisabled } />

						<span className="social-buttons__service-name">
							{ this.props.translate( 'Continue with %(service)s', {
								args: { service: 'Apple' },
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
	} ),
	null
)( localize( AppleLoginButton ) );
