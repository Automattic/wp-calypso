import config from '@automattic/calypso-config';
import { getLocaleSlug, localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import { withCurrentRoute } from 'calypso/components/route';
import WordPressLogo from 'calypso/components/wordpress-logo';
import WordPressWordmark from 'calypso/components/wordpress-wordmark';
import { isDomainConnectAuthorizePath } from 'calypso/lib/domains/utils';
import { isDefaultLocale, addLocaleToPath } from 'calypso/lib/i18n-utils';
import { login } from 'calypso/lib/paths';
import { addQueryArgs } from 'calypso/lib/route';
import Item from './item';
import Masterbar from './masterbar';

class MasterbarLoggedOut extends Component {
	static propTypes = {
		redirectUri: PropTypes.string,
		sectionName: PropTypes.string,
		title: PropTypes.string,

		// Connected props
		currentQuery: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ),
		currentRoute: PropTypes.string,
		userSiteCount: PropTypes.number,
	};

	static defaultProps = {
		sectionName: '',
		title: '',
	};

	renderLoginItem() {
		const { currentQuery, currentRoute, sectionName, translate, redirectUri } = this.props;
		if ( sectionName === 'login' ) {
			return null;
		}

		let redirectTo = null;
		if ( redirectUri ) {
			redirectTo = redirectUri;
		} else if ( currentRoute ) {
			redirectTo = currentQuery ? addQueryArgs( currentQuery, currentRoute ) : currentRoute;
		}

		const isJetpack = 'jetpack-connect' === sectionName;

		let loginUrl = login( {
			// We may know the email from Jetpack connection details
			emailAddress: isJetpack && ( currentQuery?.user_email ?? false ),
			isJetpack,
			locale: getLocaleSlug(),
			redirectTo,
		} );

		if ( currentQuery?.partner_id ) {
			loginUrl = addQueryArgs( { partner_id: currentQuery.partner_id }, loginUrl );
		}

		return (
			<Item url={ loginUrl }>
				{ translate( 'Log In', {
					context: 'Toolbar',
					comment: 'Should be shorter than ~12 chars',
				} ) }
			</Item>
		);
	}

	renderSignupItem() {
		const { currentQuery, currentRoute, locale, sectionName, translate } = this.props;

		// Hide for some sections
		if ( sectionName === 'signup' ) {
			return null;
		}

		/**
		 * Hide signup from Jetpack connect authorization step. This step handles signup as part of
		 * the flow.
		 */
		if ( currentRoute.startsWith( '/jetpack/connect/authorize' ) ) {
			return null;
		}

		/**
		 * Hide signup from the screen when we have been sent to the login page from a redirect
		 * by a service provider to authorize a Domain Connect template application.
		 */
		const redirectTo = currentQuery?.redirect_to ?? '';
		if ( isDomainConnectAuthorizePath( redirectTo ) ) {
			return null;
		}

		let signupUrl = config( 'signup_url' );
		const signupFlow = currentQuery?.signup_flow;
		if (
			// Match locales like `/log-in/jetpack/es`
			currentRoute.startsWith( '/log-in/jetpack' )
		) {
			// Basic validation that we're in a valid Jetpack Authorization flow
			if (
				currentQuery?.redirect_to?.includes( '/jetpack/connect/authorize' ) &&
				currentQuery?.redirect_to?.includes( '_wp_nonce' )
			) {
				/**
				 * `log-in/jetpack/:locale` is reached as part of the Jetpack connection flow. In
				 * this case, the redirect_to will handle signups as part of the flow. Use the
				 * `redirect_to` parameter directly for signup.
				 */
				signupUrl = currentQuery.redirect_to;
			} else {
				signupUrl = '/jetpack/connect';
			}
		} else if ( 'jetpack-connect' === sectionName ) {
			signupUrl = '/jetpack/connect';
		} else if ( signupFlow ) {
			signupUrl += '/' + signupFlow;
		}

		if ( ! isDefaultLocale( locale ) ) {
			signupUrl = addLocaleToPath( signupUrl, locale );
		}

		return (
			<Item url={ signupUrl }>
				{ translate( 'Sign Up', {
					context: 'Toolbar',
					comment: 'Should be shorter than ~12 chars',
				} ) }
			</Item>
		);
	}

	render() {
		const { title, isCheckout } = this.props;

		if ( isCheckout ) {
			return (
				<AsyncLoad
					require="calypso/layout/masterbar/checkout.tsx"
					placeholder={ null }
					title={ title }
				/>
			);
		}

		return (
			<Masterbar>
				<Item className="masterbar__item-logo">
					<WordPressLogo className="masterbar__wpcom-logo" />
					<WordPressWordmark className="masterbar__wpcom-wordmark" />
				</Item>
				<Item className="masterbar__item-title">{ title }</Item>
				<div className="masterbar__login-links">
					{ this.renderSignupItem() }
					{ this.renderLoginItem() }
				</div>
			</Masterbar>
		);
	}
}

export default withCurrentRoute( localize( MasterbarLoggedOut ) );
