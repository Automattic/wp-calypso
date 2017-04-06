/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import {
	showRequestForm as showMagicLoginRequestForm,
} from 'state/login/magic-login/actions';
import {
	emailAddressFormInput,
	isShowingRequestForm as isShowingMagicLoginRequestForm,
	isShowingExpiredPage as isShowingMagicLoginExpiredPage,
	isShowingCheckYourEmailPage,
} from 'state/login/magic-login/selectors';
import { getCurrentQueryArguments } from 'state/ui/selectors';

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
			handlingMagicLink,
			magicLoginEmailAddress,
			showingCheckYourEmailPage,
			showingMagicLoginExpiredPage,
		} = this.props;

		if ( showingMagicLoginExpiredPage ) {
			return <EmailedLoginLinkExpired />;
		}

		if ( showingCheckYourEmailPage ) {
			return <EmailedLoginLinkSuccessfully emailAddress={ magicLoginEmailAddress } />;
		}

		if ( handlingMagicLink ) {
			return <HandleEmailedLinkForm />;
		}
	}

	footerContent() {
		const {
			handlingMagicLink,
			showingCheckYourEmailPage,
			showingMagicLoginRequestForm,
			translate,
		} = this.props;

		if ( ! (
			handlingMagicLink ||
			showingCheckYourEmailPage ||
			showingMagicLoginRequestForm
		) ) {
			return <a href="#" onClick={ this.onMagicLoginRequestClick }>{ translate( 'Email me a login link' ) }</a>;
		}
	}

	render() {
		const {
			showingMagicLoginRequestForm,
			translate,
		} = this.props;

		return (
			<Main className="wp-login">
				{ this.magicLoginMainContent() || (
					<div>
						<div className="wp-login__header">
							<Gridicon icon="user-circle" size={ 72 } />
							<div>{
								// @TODO show currently logged in user if any
								translate( 'You are signed out' )
							}</div>
						</div>
						<div className="wp-login__container">
							{ showingMagicLoginRequestForm
								? <RequestLoginEmailForm />
								: <LoginBlock title={ translate( 'Sign in to WordPress.com' ) } />
							}
						</div>
						<div className="wp-login__footer">
							{ this.footerContent() }
						</div>
					</div>
				) }
			</Main>
		);
	}
}

const mapState = state => {
	const magicLoginEnabled = isEnabled( 'magic-login' );
	const queryArguments = getCurrentQueryArguments( state );

	const {
		action,
		client_id: clientId,
		email,
		token,
		tt: tokenTime,
	} = queryArguments;

	return {
		handlingMagicLink: (
			magicLoginEnabled &&
			action === 'handleLoginEmail' &&
			clientId &&
			email &&
			token &&
			tokenTime
		),
		magicLoginEmailAddress: emailAddressFormInput( state ),
		showingMagicLoginExpiredPage: magicLoginEnabled && isShowingMagicLoginExpiredPage( state ),
		showingMagicLoginRequestForm: magicLoginEnabled && isShowingMagicLoginRequestForm( state ),
		showingCheckYourEmailPage: magicLoginEnabled && isShowingCheckYourEmailPage( state ),
	};
};

const mapDispatch = {
	showMagicLoginRequestForm,
};

export default connect( mapState, mapDispatch )( localize( Login ) );
