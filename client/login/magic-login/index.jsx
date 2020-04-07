/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import page from 'page';
import classNames from 'classnames';

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
import GUTENBOARDING_BASE_NAME from 'landing/gutenboarding/basename.json';

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
			isGutenboarding: this.props.isGutenboardingLogin,
			locale: this.props.locale,
		};
		const emailAddress = get( this.props, [ 'query', 'email_address' ] );
		if ( emailAddress ) {
			loginParameters.emailAddress = emailAddress;
		}
		page( login( loginParameters ) );
	};

	renderLinks() {
		const {
			isJetpackLogin,
			isGutenboardingLogin,
			locale,
			showCheckYourEmail,
			translate,
		} = this.props;

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
			isGutenboarding: isGutenboardingLogin,
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

	renderGutenboardingLogo() {
		return (
			<div className="magic-login__gutenboarding-wordpress-logo">
				<svg
					aria-hidden="true"
					role="img"
					focusable="false"
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 20 20"
				>
					<path d="M20 10c0-5.51-4.49-10-10-10C4.48 0 0 4.49 0 10c0 5.52 4.48 10 10 10 5.51 0 10-4.48 10-10zM7.78 15.37L4.37 6.22c.55-.02 1.17-.08 1.17-.08.5-.06.44-1.13-.06-1.11 0 0-1.45.11-2.37.11-.18 0-.37 0-.58-.01C4.12 2.69 6.87 1.11 10 1.11c2.33 0 4.45.87 6.05 2.34-.68-.11-1.65.39-1.65 1.58 0 .74.45 1.36.9 2.1.35.61.55 1.36.55 2.46 0 1.49-1.4 5-1.4 5l-3.03-8.37c.54-.02.82-.17.82-.17.5-.05.44-1.25-.06-1.22 0 0-1.44.12-2.38.12-.87 0-2.33-.12-2.33-.12-.5-.03-.56 1.2-.06 1.22l.92.08 1.26 3.41zM17.41 10c.24-.64.74-1.87.43-4.25.7 1.29 1.05 2.71 1.05 4.25 0 3.29-1.73 6.24-4.4 7.78.97-2.59 1.94-5.2 2.92-7.78zM6.1 18.09C3.12 16.65 1.11 13.53 1.11 10c0-1.3.23-2.48.72-3.59C3.25 10.3 4.67 14.2 6.1 18.09zm4.03-6.63l2.58 6.98c-.86.29-1.76.45-2.71.45-.79 0-1.57-.11-2.29-.33.81-2.38 1.62-4.74 2.42-7.1z"></path>
				</svg>
			</div>
		);
	}

	render() {
		return (
			<Main
				className={ classNames( 'magic-login', 'magic-login__request-link', {
					'is-gutenboarding-login': this.props.isGutenboardingLogin,
				} ) }
			>
				{ this.props.isJetpackLogin && <JetpackHeader /> }
				{ this.props.isGutenboardingLogin && this.renderGutenboardingLogo() }

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
	isGutenboardingLogin: getCurrentRoute( state )?.startsWith(
		`/log-in/${ GUTENBOARDING_BASE_NAME }/link`
	),
} );

const mapDispatch = {
	hideMagicLoginRequestForm,
	recordPageView: withEnhancers( recordPageView, [ enhanceWithSiteType ] ),
	recordTracksEvent: withEnhancers( recordTracksEvent, [ enhanceWithSiteType ] ),
};

export default connect( mapState, mapDispatch )( localize( MagicLogin ) );
