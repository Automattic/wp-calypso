/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { compact } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import config, { isEnabled } from 'config';
import ExternalLink from 'components/external-link';
import { getCurrentQueryArguments } from 'state/ui/selectors';
import Gridicon from 'gridicons';
import Main from 'components/main';
import LoginBlock from 'blocks/login';
import { recordTracksEvent } from 'state/analytics/actions';
import { resetMagicLoginRequestForm } from 'state/login/magic-login/actions';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import GlobalNotices from 'components/global-notices';
import notices from 'notices';
import { login } from 'lib/paths';

export class Login extends React.Component {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		resetMagicLoginRequestForm: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		twoFactorAuthType: PropTypes.string,
	};

	onMagicLoginRequestClick = event => {
		event.preventDefault();
		this.props.recordTracksEvent( 'calypso_login_magic_login_request_click' );
		this.props.resetMagicLoginRequestForm();
		page( login( { isNative: true, twoFactorAuthType: 'link' } ) );
	};

	footerLinks() {
		const {
			translate,
			twoFactorAuthType
		} = this.props;

		const backToWpcomLink = (
			<a
				href="https://wordpress.com"
				key="return-to-wpcom-link"
			>
				<Gridicon icon="arrow-left" size={ 18 } /> { translate( 'Back to WordPress.com' ) }
			</a>
		);

		const magicLoginLink = isEnabled( 'magic-login' ) && ! twoFactorAuthType && (
			<a href="#"
				key="magic-login-link"
				onClick={ this.onMagicLoginRequestClick }>
					{ translate( 'Email me a login link' ) }
			</a>
		);

		const resetPasswordLink = ! twoFactorAuthType && (
			<a
				href={ config( 'login_url' ) + '?action=lostpassword' }
				key="lost-password-link">
				{ this.props.translate( 'Lost your password?' ) }
			</a>
		);

		const lostPhoneLink = twoFactorAuthType && twoFactorAuthType !== 'backup' && (
			<a
				href={ login( { isNative: true, twoFactorAuthType: 'backup' } ) }
				key="lost-phone-link">
				{ this.props.translate( "I can't access my phone" ) }
			</a>
		);

		const helpLink = twoFactorAuthType && (
			<ExternalLink
				key="help-link"
				icon={ true }
				target="_blank"
				href="http://en.support.wordpress.com/security/two-step-authentication/">
				{ translate( 'Get help' ) }
			</ExternalLink>
		);

		return compact( [
			lostPhoneLink,
			helpLink,
			magicLoginLink,
			resetPasswordLink,
			backToWpcomLink,
		] );
	}

	render() {
		const {
			queryArguments,
			translate,
			twoFactorAuthType,
		} = this.props;

		return (
			<Main className="wp-login">
				<PageViewTracker path="/login" title="Login" />

				<GlobalNotices id="notices" notices={ notices.list } />

				<div>
					<div className="wp-login__container">
						<LoginBlock
							twoFactorAuthType={ twoFactorAuthType }
							redirectLocation={ queryArguments.redirect_to }
							title={ translate( 'Log in to your account.' ) } />
					</div>
					<div className="wp-login__footer">
						{ this.footerLinks() }
					</div>
				</div>
			</Main>
		);
	}
}

const mapState = state => {
	return {
		queryArguments: getCurrentQueryArguments( state ),
	};
};

const mapDispatch = {
	recordTracksEvent,
	resetMagicLoginRequestForm,
};

export default connect( mapState, mapDispatch )( localize( Login ) );
