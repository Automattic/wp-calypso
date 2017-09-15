/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getCurrentOAuth2Client } from 'state/ui/oauth2-clients/selectors';

class LoginFooter extends Component {
	render() {
		const { translate } = this.props;
		const isOauthLogin = !! this.props.oauth2Client;
		return (
			<div
				className={ classNames( 'wp-login__footer', {
					'wp-login__footer--oauth': isOauthLogin,
					'wp-login__footer--jetpack': ! isOauthLogin,
				} ) }
			>
				{ isOauthLogin
					? <div className="wp-login__footer-links">
							<a
								href="https://wordpress.com/about/"
								rel="noopener noreferrer"
								target="_blank"
								title={ translate( 'About' ) }
							>
								{ translate( 'About' ) }
							</a>
							<a
								href="https://automattic.com/privacy/"
								rel="noopener noreferrer"
								target="_blank"
								title={ translate( 'Privacy' ) }
							>
								{ translate( 'Privacy' ) }
							</a>
							<a
								href="https://wordpress.com/tos/"
								rel="noopener noreferrer"
								target="_blank"
								title={ translate( 'Terms of Service' ) }
							>
								{ translate( 'Terms of Service' ) }
							</a>
						</div>
					: <img src="/calypso/images/jetpack/powered-by-jetpack.svg" alt="Powered by Jetpack" /> }
			</div>
		);
	}
}

LoginFooter.propTypes = {
	oauth2Client: PropTypes.object,
	translate: PropTypes.func.isRequired,
};

export default connect( state => ( {
	oauth2Client: getCurrentOAuth2Client( state ),
} ) )( localize( LoginFooter ) );
