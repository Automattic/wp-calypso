/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormsButton from 'components/forms/form-button';
import {
	getLinkingSocialUser,
	getLinkingSocialService,
} from 'state/login/selectors';

class SocialConnectPrompt extends Component {
	static propTypes = {
		linkingSocialUser: PropTypes.string,
		linkingSocialService: PropTypes.string,
		onSuccess: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	render() {
		return (
			<div className="login__social-connect-prompt">
				<div className="login__social-connect-prompt-logos">G ➡ Ⓦ</div>

				<div className="login__social-connect-prompt-message">
					{ this.props.translate( 'Connect your WordPress.com account to your %(service)s profile. ' +
					'You will be able to use %(service)s to log in to WordPress.com.', {
						args: {
							service: this.props.linkingSocialService,
						}
					} ) }
				</div>

				<div className="login__social-connect-prompt-action">
					<FormsButton primary>
						{ this.props.translate( 'Connect' ) }
					</FormsButton>
				</div>
			</div>
		);
	}
}

export default connect(
	( state ) => ( {
		linkingSocialUser: getLinkingSocialUser( state ),
		linkingSocialService: getLinkingSocialService( state ),
	} )
)( localize( SocialConnectPrompt ) );
