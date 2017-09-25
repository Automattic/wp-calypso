/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import RedirectWhenLoggedIn from 'components/redirect-when-logged-in';
import { login } from 'lib/paths';
import addQueryArgs from 'lib/route/add-query-args';
import { recordPageView } from 'state/analytics/actions';
import { hideMagicLoginRequestForm } from 'state/login/magic-login/actions';

const nativeLoginUrl = login( { isNative: true } );
const lostPasswordURL = addQueryArgs( {
	action: 'lostpassword',
}, login() );

class EmailedLoginLinkExpired extends React.Component {
	static propTypes = {
		recordPageView: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	onClickTryAgainLink = event => {
		event.preventDefault();
		this.props.hideMagicLoginRequestForm();
		page( nativeLoginUrl );
	};

	render() {
		const { translate } = this.props;
		this.props.recordPageView( '/log-in/link/use', 'Login > Link > Expired' );

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
	recordPageView,
};

export default connect( null, mapDispatchToProps )( localize( EmailedLoginLinkExpired ) );
