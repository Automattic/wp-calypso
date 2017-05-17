/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import GoogleLoginButton from 'components/social-buttons/google';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import { loginSocialUser } from 'state/login/actions';
import { isRequesting, getRequestError } from 'state/login/selectors';
import { errorNotice } from 'state/notices/actions';

class SocialLoginForm extends Component {
	static propTypes = {
		errorNotice: PropTypes.func.isRequired,
		isRequesting: PropTypes.bool.isRequired,
		onSuccess: PropTypes.func.isRequired,
		requestError: PropTypes.object,
		translate: PropTypes.func.isRequired,
	};

	constructor() {
		super();

		this.handleGoogleResponse = this.handleGoogleResponse.bind( this );
	}

	handleGoogleResponse( response ) {
		if ( ! response.Zi || ! response.Zi.id_token ) {
			return;
		}

		this.props.loginSocialUser( 'google', response.Zi.id_token ).then( () => {
			this.props.onSuccess( this.state );
		} ).catch( error => {
			if ( error.field === 'global' ) {
				if ( error.message === 'proxy_required' ) {
					// TODO: Remove once the proxy requirement is removed from the API

					let redirectTo = '';

					if ( typeof window !== 'undefined' && window.location.search.indexOf( '?redirect_to=' ) === 0 ) {
						redirectTo = window.location.search;
					}

					this.props.errorNotice(
						<p>
							{ 'This endpoint is restricted to proxied Automatticians for now. Please use ' }
							<a href={ config( 'login_url' ) + redirectTo }>the old login page</a>.
						</p>
					);
				} else {
					this.props.errorNotice( error.message );
				}
			}
		} );
	}

	render() {
		return (
			<div className="login__social">
				<p>
					{ this.props.translate( 'Or login with your existing social profile:' ) }
				</p>

				<div className="login__social-buttons">
					<GoogleLoginButton
						clientId={ config( 'google_oauth_client_id' ) }
						responseHandler={ this.handleGoogleResponse } />
				</div>
			</div>
		);
	}
}

export default connect(
	( state ) => ( {
		isRequesting: isRequesting( state ),
		requestError: getRequestError( state ),
	} ),
	{
		errorNotice,
		loginSocialUser,
	}
)( localize( SocialLoginForm ) );
