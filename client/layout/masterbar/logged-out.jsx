/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import Masterbar from './masterbar';
import { connect } from 'react-redux';
import { getLocaleSlug, localize } from 'i18n-calypso';
import { get, includes, startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import Item from './item';
import WordPressLogo from 'components/wordpress-logo';
import WordPressWordmark from 'components/wordpress-wordmark';
import { addQueryArgs } from 'lib/route';
import { getCurrentQueryArguments, getCurrentRoute } from 'state/selectors';
import { login } from 'lib/paths';

class MasterbarLoggedOut extends PureComponent {
	static propTypes = {
		redirectUri: PropTypes.string,
		sectionName: PropTypes.string,
		title: PropTypes.string,

		// Connected props
		currentQuery: PropTypes.object,
		currentRoute: PropTypes.string,
	};

	static defaultProps = {
		sectionName: '',
		title: '',
	};

	renderLoginItem() {
		const { currentQuery, currentRoute, sectionName, translate, redirectUri } = this.props;

		if ( includes( [ 'login', 'jetpack-onboarding' ], sectionName ) ) {
			return null;
		}

		let redirectTo = null;
		if ( redirectUri ) {
			redirectTo = redirectUri;
		} else if ( currentRoute ) {
			redirectTo = currentQuery ? addQueryArgs( currentQuery, currentRoute ) : currentRoute;
		}

		const isJetpack = 'jetpack-connect' === sectionName;

		const loginUrl = login( {
			// We may know the email from Jetpack connection details
			emailAddress: isJetpack && get( currentQuery, 'user_email', false ),
			isJetpack,
			isNative: config.isEnabled( 'login/native-login-links' ),
			locale: getLocaleSlug(),
			redirectTo,
		} );

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
		const { currentQuery, currentRoute, sectionName, translate } = this.props;

		// Hide for some sections
		if ( includes( [ 'signup', 'jetpack-onboarding' ], sectionName ) ) {
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

		let signupUrl = config( 'signup_url' );
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
		const { title } = this.props;
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

export default connect( state => ( {
	currentQuery: getCurrentQueryArguments( state ),
	currentRoute: getCurrentRoute( state ),
} ) )( localize( MasterbarLoggedOut ) );
