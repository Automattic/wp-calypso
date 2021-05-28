/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { login, lostPassword } from 'calypso/lib/paths';
import EmptyContent from 'calypso/components/empty-content';
import RedirectWhenLoggedIn from 'calypso/components/redirect-when-logged-in';
import { hideMagicLoginRequestForm } from 'calypso/state/login/magic-login/actions';
import {
	recordPageViewWithClientId as recordPageView,
	enhanceWithSiteType,
} from 'calypso/state/analytics/actions';
import { withEnhancers } from 'calypso/state/utils';

class EmailedLoginLinkExpired extends React.Component {
	static propTypes = {
		hideMagicLoginRequestForm: PropTypes.func.isRequired,
		recordPageView: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	componentDidMount() {
		this.props.recordPageView( '/log-in/link/use', 'Login > Link > Expired' );
	}

	onClickTryAgainLink = () => {
		this.props.hideMagicLoginRequestForm();
	};

	render() {
		const { translate } = this.props;

		return (
			<div>
				<RedirectWhenLoggedIn
					delayAtMount={ 3500 }
					redirectTo="/"
					replaceCurrentLocation={ true }
				/>

				<EmptyContent
					action={ translate( 'Try again' ) }
					actionCallback={ this.onClickTryAgainLink }
					actionURL={ login( { twoFactorAuthType: 'link' } ) }
					className="magic-login__link-expired"
					illustration={ '/calypso/images/illustrations/illustration-404.svg' }
					illustrationWidth={ 500 }
					line={ translate( 'Maybe try resetting your password instead' ) }
					secondaryAction={ translate( 'Reset my password' ) }
					secondaryActionURL={ lostPassword() }
					title={ translate( 'Login link is expired or invalid' ) }
				/>
			</div>
		);
	}
}

const mapDispatchToProps = {
	hideMagicLoginRequestForm,
	recordPageView: withEnhancers( recordPageView, [ enhanceWithSiteType ] ),
};

export default connect( null, mapDispatchToProps )( localize( EmailedLoginLinkExpired ) );
