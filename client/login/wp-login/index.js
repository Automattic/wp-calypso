/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import config from 'config';
import {
	showMagicLoginInterstitialPage,
	showMagicLoginRequestForm,
} from 'state/login/magic-login/actions';

/**
 * Internal dependencies
 */
import {
	CHECK_YOUR_EMAIL_PAGE,
	INTERSTITIAL_PAGE,
	LINK_EXPIRED_PAGE,
	REQUEST_FORM,
} from 'state/login/magic-login/constants';

import {
	getMagicLoginEmailAddressFormInput,
	getMagicLoginCurrentView,
} from 'state/selectors';
import { getCurrentQueryArguments } from 'state/ui/selectors';
import Gridicon from 'gridicons';
import Main from 'components/main';
import LoginBlock from 'blocks/login';
import RequestLoginEmailForm from '../magic-login/request-login-email-form';
import HandleEmailedLinkForm from '../magic-login/handle-emailed-link-form';
import EmailedLoginLinkSuccessfully from '../magic-login/emailed-login-link-successfully';
import EmailedLoginLinkExpired from '../magic-login/emailed-login-link-expired';
import { isEnabled } from 'config';
import { localize } from 'i18n-calypso';

class Login extends React.Component {
	onMagicLoginRequestClick = event => {
		event.preventDefault();
		this.props.showMagicLoginRequestForm();
	}

	magicLoginMainContent() {
		const {
			magicLoginView,
			magicLoginEmailAddress,
		} = this.props;

		switch ( magicLoginView ) {
			case LINK_EXPIRED_PAGE:
				return <EmailedLoginLinkExpired />;
			case CHECK_YOUR_EMAIL_PAGE:
				return <EmailedLoginLinkSuccessfully emailAddress={ magicLoginEmailAddress } />;
			case INTERSTITIAL_PAGE:
				return <HandleEmailedLinkForm />;
		}
	}

	componentWillMount() {
		const {
			magicLoginEnabled,
			queryArguments,
		} = this.props;

		if ( magicLoginEnabled && queryArguments && queryArguments.action === 'handleLoginEmail' ) {
			this.props.showMagicLoginInterstitialPage();
		}
	}

	goBack( event ) {
		event.preventDefault();

		if ( typeof window !== 'undefined' ) {
			window.history.back();
		}
	}

	footerContent() {
		const {
			magicLoginEnabled,
			magicLoginView,
			translate,
		} = this.props;
		let loginLink;

		if ( magicLoginEnabled && ! magicLoginView ) {
			loginLink = <a href="#" onClick={ this.props.onMagicLoginRequestClick }>{ translate( 'Email me a login link' ) }</a>;
		}

		return (
			<div className="wp-login__footer">
				{ loginLink }
				<a href={ config( 'login_url' ) + '?action=lostpassword' }>{ this.props.translate( 'Lost your password?' ) }</a>
				<a href="#" onClick={ this.goBack }><Gridicon icon="arrow-left" size={ 18 } /> { this.props.translate( 'Back' ) }</a>
			</div>
		);
	}

	render() {
		const {
			magicLoginView,
			translate,
		} = this.props;

		return (
			<Main className="wp-login">
				{ this.magicLoginMainContent() || (
					<div>
						<div className="wp-login__container">
							{ magicLoginView === REQUEST_FORM
								? <RequestLoginEmailForm />
								: <LoginBlock title={ translate( 'Log in to your account' ) } />
							}
						</div>
						{ this.footerContent() }
					</div>
				) }
			</Main>
		);
	}
}

const mapState = state => {
	const magicLoginEnabled = isEnabled( 'magic-login' );
	return {
		magicLoginEnabled,
		magicLoginEmailAddress: getMagicLoginEmailAddressFormInput( state ),
		magicLoginView: magicLoginEnabled ? getMagicLoginCurrentView( state ) : null,
		queryArguments: getCurrentQueryArguments( state ),
	};
};

const mapDispatch = {
	showMagicLoginInterstitialPage,
	showMagicLoginRequestForm,
};

export default connect( mapState, mapDispatch )( localize( Login ) );
