/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import page from 'page';

/**
 * Internal dependencies
 */
import notices from 'notices';
import { login } from 'lib/paths';
import { CHECK_YOUR_EMAIL_PAGE } from 'state/login/magic-login/constants';
import getCurrentLocaleSlug from 'state/selectors/get-current-locale-slug';
import getCurrentQueryArguments from 'state/selectors/get-current-query-arguments';
import getMagicLoginCurrentView from 'state/selectors/get-magic-login-current-view';
import { getCurrentRoute } from 'state/selectors/get-current-route';
import { hideMagicLoginRequestForm } from 'state/login/magic-login/actions';
import LocaleSuggestions from 'components/locale-suggestions';
import {
	recordTracksEventWithClientId as recordTracksEvent,
	recordPageViewWithClientId as recordPageView,
	enhanceWithSiteType,
} from 'state/analytics/actions';
import { withEnhancers } from 'state/utils';
import Main from 'components/main';
import JetpackHeader from 'components/jetpack-header';
import RequestLoginEmailForm from './request-login-email-form';
import GlobalNotices from 'components/global-notices';
import Gridicon from 'components/gridicon';

/**
 * Style dependencies
 */
import './style.scss';

class MagicLogin extends React.Component {
	static propTypes = {
		path: PropTypes.string.isRequired,

		// mapped to dispatch
		hideMagicLoginRequestForm: PropTypes.func.isRequired,
		recordPageView: PropTypes.func.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,

		// mapped to state
		locale: PropTypes.string.isRequired,
		query: PropTypes.object,
		showCheckYourEmail: PropTypes.bool.isRequired,

		// From `localize`
		translate: PropTypes.func.isRequired,
	};

	componentDidMount() {
		this.props.recordPageView( '/log-in/link', 'Login > Link' );
	}

	onClickEnterPasswordInstead = event => {
		event.preventDefault();

		this.props.recordTracksEvent( 'calypso_login_email_link_page_click_back' );

		const loginParameters = {
			isNative: true,
			isJetpack: this.props.isJetpackLogin,
			locale: this.props.locale,
		};
		const emailAddress = get( this.props, [ 'query', 'email_address' ] );
		if ( emailAddress ) {
			loginParameters.emailAddress = emailAddress;
		}
		page( login( loginParameters ) );
	};

	renderLinks() {
		const { isJetpackLogin, locale, showCheckYourEmail, translate } = this.props;

		if ( showCheckYourEmail ) {
			return null;
		}

		// The email address from the URL (if present) is added to the login
		// parameters in this.onClickEnterPasswordInstead(). But it's left out
		// here deliberately, to ensure that if someone copies this link to
		// paste somewhere else, their email address isn't included in it.
		const loginParameters = {
			isNative: true,
			isJetpack: isJetpackLogin,
			locale: locale,
		};

		return (
			<div className="magic-login__footer">
				<a href={ login( loginParameters ) } onClick={ this.onClickEnterPasswordInstead }>
					<Gridicon icon="arrow-left" size={ 18 } />
					{ translate( 'Enter a password instead' ) }
				</a>
			</div>
		);
	}

	renderLocaleSuggestions() {
		const { locale, path, showCheckYourEmail } = this.props;

		if ( showCheckYourEmail ) {
			return null;
		}

		return <LocaleSuggestions locale={ locale } path={ path } />;
	}

	render() {
		return (
			<Main className="magic-login magic-login__request-link">
				{ this.props.isJetpackLogin && ( <JetpackHeader/> ) }

				{ this.renderLocaleSuggestions() }

				<GlobalNotices id="notices" notices={ notices.list } />

				<RequestLoginEmailForm />

				{ this.renderLinks() }
			</Main>
		);
	}
}

const mapState = state => ( {
	locale: getCurrentLocaleSlug( state ),
	query: getCurrentQueryArguments( state ),
	showCheckYourEmail: getMagicLoginCurrentView( state ) === CHECK_YOUR_EMAIL_PAGE,
	isJetpackLogin: getCurrentRoute( state ) === '/log-in/jetpack/link',
} );

const mapDispatch = {
	hideMagicLoginRequestForm,
	recordPageView: withEnhancers( recordPageView, [ enhanceWithSiteType ] ),
	recordTracksEvent: withEnhancers( recordTracksEvent, [ enhanceWithSiteType ] ),
};

export default connect( mapState, mapDispatch )( localize( MagicLogin ) );
