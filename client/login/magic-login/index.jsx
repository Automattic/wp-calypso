/**
 * External dependencies
 */
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import RequestLoginEmailForm from './request-login-email-form';
import GlobalNotices from 'components/global-notices';
import Main from 'components/main';
import { login } from 'lib/paths';
import notices from 'notices';
import { recordPageView, recordTracksEvent } from 'state/analytics/actions';
import { hideMagicLoginRequestForm } from 'state/login/magic-login/actions';
import { CHECK_YOUR_EMAIL_PAGE } from 'state/login/magic-login/constants';
import { getMagicLoginCurrentView } from 'state/selectors';

class MagicLogin extends React.Component {
	static propTypes = {
		// mapped to dispatch
		hideMagicLoginRequestForm: PropTypes.func.isRequired,
		recordPageView: PropTypes.func.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,

		// mapped to state
		showCheckYourEmail: PropTypes.bool.isRequired,

		// From `localize`
		translate: PropTypes.func.isRequired,
	};

	onClickEnterPasswordInstead = event => {
		event.preventDefault();
		this.props.recordTracksEvent( 'calypso_login_email_link_page_click_back' );

		page( login( { isNative: true } ) );
	};

	render() {
		const {
			showCheckYourEmail,
			translate,
		} = this.props;

		this.props.recordPageView( '/log-in/link', 'Login > Link' );

		const footer = ! showCheckYourEmail && (
			<div className="magic-login__footer">
				<a href="#" onClick={ this.onClickEnterPasswordInstead }>
					<Gridicon icon="arrow-left" size={ 18 } /> { translate( 'Enter a password instead' ) }
				</a>
			</div>
		);

		const classes = classNames( 'magic-login', 'magic-login__request-link' );

		return (
			<Main className={ classes }>
				<GlobalNotices id="notices" notices={ notices.list } />
				<RequestLoginEmailForm />
				{ footer }
			</Main>
		);
	}
}

const mapState = ( state ) => ( {
	showCheckYourEmail: getMagicLoginCurrentView( state ) === CHECK_YOUR_EMAIL_PAGE,
} );

const mapDispatch = {
	hideMagicLoginRequestForm,
	recordPageView,
	recordTracksEvent,
};

export default connect( mapState, mapDispatch )( localize( MagicLogin ) );
