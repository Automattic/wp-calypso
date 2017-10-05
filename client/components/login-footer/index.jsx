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
import JetpackColophon from 'components/jetpack-colophon';

class LoginFooter extends Component {
	render() {
		const { translate } = this.props;
		const isOauthLogin = !! this.props.oauth2Client;
		return (
			<div
				className={ classNames( 'login-footer', {
					'login-footer__oauth': isOauthLogin,
					'login-footer__jetpack': ! isOauthLogin,
				} ) }
			>
				{ isOauthLogin
					? <div className="login-footer__links">
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
					: <JetpackColophon /> }
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
