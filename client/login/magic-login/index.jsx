/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import notices from 'notices';
import { login } from 'lib/paths';
import {
	CHECK_YOUR_EMAIL_PAGE,
} from 'state/login/magic-login/constants';
import {
	getMagicLoginEmailAddressFormInput,
	getMagicLoginCurrentView,
} from 'state/selectors';
import { getCurrentQueryArguments } from 'state/ui/selectors';
import {
	hideMagicLoginRequestForm,
} from 'state/login/magic-login/actions';
import { recordTracksEvent } from 'state/analytics/actions';
import Main from 'components/main';
import EmailedLoginLinkSuccessfully from './emailed-login-link-successfully';
import RequestLoginEmailForm from './request-login-email-form';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import GlobalNotices from 'components/global-notices';
import Gridicon from 'gridicons';

class MagicLogin extends React.Component {
	static propTypes = {
		hideMagicLoginRequestForm: PropTypes.func.isRequired,
		magicLoginEmailAddress: PropTypes.string,
		magicLoginEnabled: PropTypes.bool,
		recordTracksEvent: PropTypes.func.isRequired,
		showCheckYourEmail: PropTypes.bool.isRequired,
		translate: PropTypes.func.isRequired,
	};

	onClickEnterPasswordInstead = event => {
		event.preventDefault();
		this.props.recordTracksEvent( 'calypso_login_enter_password_instead_click' );

		page( login( { isNative: true } ) );
	};

	magicLoginMainContent() {
		const {
			magicLoginEmailAddress,
			showCheckYourEmail,
			translate,
		} = this.props;

		if ( showCheckYourEmail ) {
			this.props.recordTracksEvent( 'calypso_login_magic_link_link_sent_view' );
			return <EmailedLoginLinkSuccessfully emailAddress={ magicLoginEmailAddress } />;
		}

		this.props.recordTracksEvent( 'calypso_login_magic_link_request_email_view' );
		return (
			<div>
				<RequestLoginEmailForm />
				<div className="magic-login__footer">
					<a href="#" onClick={ this.onClickEnterPasswordInstead }>
						<Gridicon icon="arrow-left" size={ 18 } /> { translate( 'Enter a password instead' ) }
					</a>
				</div>
			</div>
		);
	}

	pageViewTracker() {
		const path = '/log-in/link';
		const title = 'Login > Link';

		return <PageViewTracker path={ path } title={ title } />;
	}

	render() {
		const {
			showCheckYourEmail,
		} = this.props;
		return (
			<Main className={ {
				'magic-login': true,
				'magic-login__request_link': ! showCheckYourEmail,
			} }>
				{ this.pageViewTracker() }
				<GlobalNotices id="notices" notices={ notices.list } />
				{ this.magicLoginMainContent() }
			</Main>
		);
	}
}

const mapState = state => {
	const magicLoginEnabled = isEnabled( 'login/magic-login' );

	return {
		magicLoginEnabled,
		magicLoginEmailAddress: getMagicLoginEmailAddressFormInput( state ),
		showCheckYourEmail: getMagicLoginCurrentView( state ) === CHECK_YOUR_EMAIL_PAGE,
		queryArguments: getCurrentQueryArguments( state ),
	};
};

const mapDispatch = {
	hideMagicLoginRequestForm,
	recordTracksEvent,
};

export default connect( mapState, mapDispatch )( localize( MagicLogin ) );
