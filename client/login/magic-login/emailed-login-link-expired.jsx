/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import addQueryArgs from 'lib/route/add-query-args';
import config from 'config';
import EmptyContent from 'components/empty-content';
import RedirectWhenLoggedIn from 'components/redirect-when-logged-in';
import { recordPageView } from 'state/analytics/actions';

const lostPasswordURL = addQueryArgs( {
	action: 'lostpassword',
}, config( 'login_url' ) );

class EmailedLoginLinkExpired extends React.Component {
	static propTypes = {
		recordPageView: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	render() {
		const {
			translate,
		} = this.props;
		this.props.recordPageView( '/log-in/link/use', 'Login > Link > Expired' );

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

const mapDispatchToProps = {
	recordPageView,
};

export default connect( null, mapDispatchToProps )( localize( EmailedLoginLinkExpired ) );
