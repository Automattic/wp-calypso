/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import addQueryArgs from 'lib/route/add-query-args';
import config from 'config';
import EmptyContent from 'components/empty-content';
import RedirectWhenLoggedIn from 'components/redirect-when-logged-in';

const lostPasswordURL = addQueryArgs( {
	action: 'lostpassword',
}, config( 'login_url' ) );

class EmailedLoginLinkExpired extends React.Component {
	render() {
		const { translate } = this.props;
		this.props.recordTracksEvent( 'calypso_login_magic_link_expired_link_view' );

		return (
			<div>
				<RedirectWhenLoggedIn
					delayAtMount={ 3500 }
					redirectTo="/"
					replaceCurrentLocation={ true }
				/>
				<EmptyContent
					action={ translate( 'Return to WordPress.com' ) }
					actionURL={ '/' }
					illustration={ '/calypso/images/illustrations/illustration-404.svg' }
					illustrationWidth={ 500 }
					line={ translate( 'Maybe try resetting your password instead' ) }
					secondaryAction={ translate( 'Reset my password' ) }
					secondaryActionURL={ lostPasswordURL }
					title={ translate( 'Login link is expired or invalid' ) }
					/>
			</div>
		);
	}
}

const mapDispatch = {
	recordTracksEvent,
};

export default connect( null, mapDispatch )( localize( EmailedLoginLinkExpired ) );
