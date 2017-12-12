/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import page from 'page';

/**
 * Internal dependencies
 */
import notices from 'notices';
import { login } from 'lib/paths';
import { CHECK_YOUR_EMAIL_PAGE } from 'state/login/magic-login/constants';
import { getMagicLoginCurrentView } from 'state/selectors';
import { hideMagicLoginRequestForm } from 'state/login/magic-login/actions';
import {
	recordTracksEventWithClientId as recordTracksEvent,
	recordPageViewWithClientId as recordPageView,
} from 'state/analytics/actions';
import Main from 'components/main';
import RequestLoginEmailForm from './request-login-email-form';
import GlobalNotices from 'components/global-notices';
import Gridicon from 'gridicons';

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
		const { showCheckYourEmail, translate } = this.props;

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

const mapState = state => ( {
	showCheckYourEmail: getMagicLoginCurrentView( state ) === CHECK_YOUR_EMAIL_PAGE,
} );

const mapDispatch = {
	hideMagicLoginRequestForm,
	recordPageView,
	recordTracksEvent,
};

export default connect( mapState, mapDispatch )( localize( MagicLogin ) );
