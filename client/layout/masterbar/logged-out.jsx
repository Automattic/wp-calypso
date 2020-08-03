/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { getLocaleSlug, localize } from 'i18n-calypso';
import { get, includes, startsWith } from 'lodash';
import { defaultRegistry } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import config from 'config';
import Masterbar from './masterbar';
import Item from './item';
import WordPressLogo from 'components/wordpress-logo';
import WordPressWordmark from 'components/wordpress-wordmark';
import { addQueryArgs } from 'lib/route';
import getCurrentQueryArguments from 'state/selectors/get-current-query-arguments';
import getCurrentRoute from 'state/selectors/get-current-route';
import { login } from 'lib/paths';
import { isDomainConnectAuthorizePath } from 'lib/domains/utils';
import { isDefaultLocale, addLocaleToPath } from 'lib/i18n-utils';
import { recordTracksEvent } from 'state/analytics/actions';

class MasterbarLoggedOut extends React.Component {
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
		if ( includes( [ 'login' ], sectionName ) ) {
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
			emailAddress: isJetpack && get( currentQuery, 'user_email', false ),
			isJetpack,
			isNative: config.isEnabled( 'login/native-login-links' ),
			locale: getLocaleSlug(),
			redirectTo,
		} );

		if ( currentQuery && currentQuery.partner_id ) {
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
		if ( includes( [ 'signup' ], sectionName ) ) {
			return null;
		}

		/**
		 * Hide signup from Jetpack connect authorization step. This step handles signup as part of
		 * the flow.
		 */
		if ( startsWith( currentRoute, '/jetpack/connect/authorize' ) ) {
			return null;
		}

		/**
		 * Hide signup from from New Site screen. This allows starting with a new Jetpack or
		 * WordPress.com site.
		 */
		if ( startsWith( currentRoute, '/jetpack/new' ) ) {
			return null;
		}

		/**
		 * Hide signup from the screen when we have been sent to the login page from a redirect
		 * by a service provider to authorize a Domain Connect template application.
		 */
		const redirectTo = get( currentQuery, 'redirect_to', '' );
		if ( isDomainConnectAuthorizePath( redirectTo ) ) {
			return null;
		}

		let signupUrl = config( 'signup_url' );
		const signupFlow = get( currentQuery, 'signup_flow' );
		if (
			// Match locales like `/log-in/jetpack/es`
			startsWith( currentRoute, '/log-in/jetpack' )
		) {
			// Basic validation that we're in a valid Jetpack Authorization flow
			if (
				includes( get( currentQuery, 'redirect_to' ), '/jetpack/connect/authorize' ) &&
				includes( get( currentQuery, 'redirect_to' ), '_wp_nonce' )
			) {
				/**
				 * `log-in/jetpack/:locale` is reached as part of the Jetpack connection flow. In
				 * this case, the redirect_to will handle signups as part of the flow. Use the
				 * `redirect_to` parameter directly for signup.
				 */
				signupUrl = currentQuery.redirect_to;
			} else {
				signupUrl = '/jetpack/new';
			}
		} else if ( 'jetpack-connect' === sectionName ) {
			signupUrl = '/jetpack/new';
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
	clickClose = () => {
		const { select } = defaultRegistry;
		const siteSlug = select( 'wpcom' )?.getSiteSlug();
		const closeUrl = siteSlug ? '/plans/' + siteSlug : '/start';
		this.props.recordTracksEvent( 'calypso_masterbar_close_clicked' );
		window.location = closeUrl;
	};

	render() {
		const { title, isCheckout, translate } = this.props;

		if ( isCheckout === true ) {
			return (
				<Masterbar>
					<div className="masterbar__secure-checkout">
						<Item
							url={ '#' }
							icon="cross"
							className="masterbar__close-button"
							onClick={ this.clickClose }
							tooltip={ translate( 'Close Checkout' ) }
							tipTarget="close"
						/>
						<Item className="masterbar__item-logo">
							<WordPressLogo className="masterbar__wpcom-logo" />
							<WordPressWordmark className="masterbar__wpcom-wordmark" />
						</Item>
						<span className="masterbar__secure-checkout-text">
							{ translate( 'Secure checkout' ) }
						</span>
					</div>
					<Item className="masterbar__item-title">{ title }</Item>
				</Masterbar>
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

export default connect(
	( state ) => (
		{
			currentQuery: getCurrentQueryArguments( state ),
			currentRoute: getCurrentRoute( state ),
		},
		{ recordTracksEvent }
	)
)( localize( MasterbarLoggedOut ) );
