/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import RedirectWhenLoggedIn from 'components/redirect-when-logged-in';

class EmailedLoginLinkExpired extends React.Component {
	render() {
		const { translate } = this.props;

		return (
			<div>
				<RedirectWhenLoggedIn
					redirectTo="/"
					replaceCurrentLocation={ true }
				/>
				<EmptyContent
					action={ translate( 'Return to WordPress.com' ) }
					actionURL={ '/' }
					illustration={ '/calypso/images/drake/drake-404.svg' }
					illustrationWidth={ 500 }
					line={ translate( 'Maybe try resetting your password instead' ) }
					secondaryAction={ translate( 'Reset my password' ) }
					secondaryActionURL={ 'https://wordpress.com/wp-login.php?action=lostpassword' }
					title={ translate( 'Login link is expired or invalid' ) }
					/>
			</div>
		);
	}
}

// `connect`ing here so `RedirectWhenLoggedIn` can do the same
export default connect()( localize( EmailedLoginLinkExpired ) );
