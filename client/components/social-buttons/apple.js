import config from '@automattic/calypso-config';
import { loadScript } from '@automattic/load-script';
import requestExternalAccess from '@automattic/request-external-access';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { cloneElement, Component, Fragment } from 'react';
import { connect } from 'react-redux';
import AppleIcon from 'calypso/components/social-icons/apple';
import { isFormDisabled } from 'calypso/state/login/selectors';

import './style.scss';

const appleClientUrl =
	'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
const connectUrlPopupFLow =
	'https://public-api.wordpress.com/connect/?magic=keyring&service=apple&action=request&for=connect';
const noop = () => {};

class AppleLoginButton extends Component {
	static propTypes = {
		clientId: PropTypes.string.isRequired,
		isFormDisabled: PropTypes.bool,
		redirectUri: PropTypes.string,
		responseHandler: PropTypes.func.isRequired,
		scope: PropTypes.string,
		uxMode: PropTypes.oneOf( [ 'redirect', 'popup' ] ),
		socialServiceResponse: PropTypes.object,
		originalUrlPath: PropTypes.string,
		queryString: PropTypes.string,
	};

	static defaultProps = {
		onClick: noop,
		scope: 'name email',
		uxMode: 'popup',
		originalUrlPath: null,
		queryString: null,
	};

	appleClient = null;

	getUxMode() {
		return config.isEnabled( 'sign-in-with-apple/redirect' ) ? 'redirect' : this.props.uxMode;
	}

	componentDidMount() {
		if ( ! config.isEnabled( 'sign-in-with-apple' ) ) {
			return;
		}

		if ( this.getUxMode() === 'redirect' ) {
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
			state: JSON.stringify( {
				oauth2State,
				originalUrlPath: this.props.originalUrlPath,
				queryString: this.props.queryString,
			} ),
		} );

		this.appleClient = window.AppleID;

		return this.appleClient;
	}

	handleClick = ( event ) => {
		event.preventDefault();

		if ( this.props.onClick ) {
			this.props.onClick( event );
		}

		if ( this.getUxMode() === 'popup' ) {
			requestExternalAccess( connectUrlPopupFLow, this.props.responseHandler );
			return;
		}

		if ( this.getUxMode() === 'redirect' ) {
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
						className={ clsx( 'social-buttons__button button apple', { disabled: isDisabled } ) }
						onClick={ this.handleClick }
					>
						<AppleIcon
							isDisabled={ isDisabled }
							width={ this.props.isReskinned ? 17 : 20 }
							height={ this.props.isReskinned ? 17 : 20 }
						/>

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
