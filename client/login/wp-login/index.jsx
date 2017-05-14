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
import { getCurrentQueryArguments } from 'state/ui/selectors';
import Gridicon from 'gridicons';
import Main from 'components/main';
import LoginBlock from 'blocks/login';
import { recordTracksEvent } from 'state/analytics/actions';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import GlobalNotices from 'components/global-notices';
import notices from 'notices';
import { login } from 'lib/paths';

class Login extends React.Component {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		twoFactorAuthType: PropTypes.string,
	};

	onMagicLoginRequestClick = event => {
		event.preventDefault();
		this.props.recordTracksEvent( 'calypso_login_magic_login_request_click' );

		page( login( { twoFactorAuthType: 'link' } ) );
	};

	goBack = event => {
		event.preventDefault();

		this.props.recordTracksEvent( 'calypso_login_go_back_click' );

		if ( typeof window !== 'undefined' ) {
			window.history.back();
		}
	};

	footerLinks() {
		const { translate } = this.props;

		const goBackLink = <a
			href="#"
			key="back-link"
			onClick={ this.goBack }>
				<Gridicon icon="arrow-left" size={ 18 } /> { this.props.translate( 'Return' ) }
			</a>;
		const showMagicLoginLink = isEnabled( 'magic-login' ) && <a href="#"
			key="magic-login-link"
			onClick={ this.onMagicLoginRequestClick }>
				{ translate( 'Email me a login link' ) }
			</a>;
		const resetPasswordLink = <a
			href={ config( 'login_url' ) + '?action=lostpassword' }
			key="lost-password-link">
				{ this.props.translate( 'Lost your password?' ) }
			</a>;

		return compact( [
			goBackLink,
			showMagicLoginLink,
			resetPasswordLink,
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
	recordTracksEvent
};

export default connect( mapState, mapDispatch )( localize( Login ) );
