/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import { login } from 'lib/paths';
import { addQueryArgs } from 'lib/route';
import EmptyContent from 'components/empty-content';
import RedirectWhenLoggedIn from 'components/redirect-when-logged-in';
import { hideMagicLoginRequestForm } from 'state/login/magic-login/actions';
import {
	recordPageViewWithClientId as recordPageView,
	enhanceWithSiteType,
} from 'state/analytics/actions';
import { withEnhancers } from 'state/utils';

const nativeLoginUrl = login( { isNative: true, twoFactorAuthType: 'link' } );

const lostPasswordURL = addQueryArgs(
	{
		action: 'lostpassword',
	},
	login()
);

class EmailedLoginLinkExpired extends React.Component {
	static propTypes = {
		hideMagicLoginRequestForm: PropTypes.func.isRequired,
		recordPageView: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	componentDidMount() {
		this.props.recordPageView( '/log-in/link/use', 'Login > Link > Expired' );
	}

	onClickTryAgainLink = ( event ) => {
		event.preventDefault();

		this.props.hideMagicLoginRequestForm();

		page( nativeLoginUrl );
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
					actionURL={ nativeLoginUrl }
					className="magic-login__link-expired"
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
	hideMagicLoginRequestForm,
	recordPageView: withEnhancers( recordPageView, [ enhanceWithSiteType ] ),
};

export default connect( null, mapDispatchToProps )( localize( EmailedLoginLinkExpired ) );
